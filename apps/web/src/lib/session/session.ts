import type { AppRouter } from "@storage-minis/api/types";
import { isCancelledError, type QueryClient } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import { errorCodeOf, trpc } from "../trpc";
import type { AuthPort, AuthUser, GoogleSignInOptions } from "./authPort";
import { isPastLimit, type SavedSession, tokenAuthTime } from "./savedSession";
import {
  canRedirect,
  chooseSignInMethod,
  clearRedirecting,
  markRedirecting,
  type SignInContext,
  type SignInFailure,
  signInFailure,
} from "./signInMethod";

// The session layer (sign-in plan SI-12). It loads Firebase only when a route
// asks for the session, so the catalog never loads it; it keeps the session's
// `auth_time` and the active Organization for the request headers, and turns
// Firebase's sign-ins and sign-outs, here or in another tab, into route
// guard runs. The guard is not an authorization boundary: the API is.

export type SessionAnswer = inferRouterOutputs<AppRouter>["session"]["get"];
type MemberAnswer = Extract<SessionAnswer, { status: "member" }>;
export type SessionUser = MemberAnswer["user"];
export type Membership = MemberAnswer["memberships"][number];
export type Organization = Membership["organization"];

export interface MemberSession {
  readonly user: SessionUser;
  readonly memberships: readonly Membership[];
  /**
   * W5's active Organization: the only Membership's, or the lowest ID while a
   * User has several, until the Organization switcher exists.
   */
  readonly organization: Organization;
  /** The Membership role in the active Organization. */
  readonly role: Membership["role"];
}

export type SessionState =
  | { readonly status: "signedOut" }
  | { readonly status: "noAccess" }
  | { readonly status: "member"; readonly member: MemberSession };

/** What the Login page explains after the app signed someone out. */
export type LoginNotice =
  | { readonly kind: "sessionEnded" }
  /** State 4; `email` is null for a custom-token test user. */
  | { readonly kind: "noAccess"; readonly email: string | null };

export type SignInResult =
  | { readonly status: "member" | "noAccess" | "redirecting" }
  | { readonly status: "failed"; readonly failure: SignInFailure };

export interface SessionDependencies {
  readonly queryClient: QueryClient;
  /** The startup check (SI-10), run once, before Firebase loads. */
  checkSavedSession(): Promise<SavedSession>;
  /** Loads Firebase (SI-09). */
  loadAuth(): Promise<AuthPort>;
  /** `session.get`, which may run the one-time bootstrap. */
  fetchSession(): Promise<SessionAnswer>;
  /** The values that decide popup or redirect (SI-11). */
  signInContext(): SignInContext;
  now?: () => number;
}

/** The part of the router the session uses: re-running the route guards. */
export interface GuardedRouter {
  invalidate(): Promise<void>;
}

/** Thrown into a request that the 7-day limit stopped before it was sent. */
export class SessionEndedError extends Error {
  constructor() {
    super("The session passed the 7-day limit.");
    this.name = "SessionEndedError";
  }
}

const signedOut: SessionState = { status: "signedOut" };

function memberSession(answer: MemberAnswer): MemberSession {
  const [first, ...others] = answer.memberships;
  if (first === undefined) {
    throw new Error("A member session has no Membership.");
  }
  const active = others.reduce(
    (lowest, membership) =>
      membership.organization.id < lowest.organization.id ? membership : lowest,
    first,
  );
  return {
    user: answer.user,
    memberships: answer.memberships,
    organization: active.organization,
    role: active.role,
  };
}

export interface Session {
  /**
   * The route guards' check: loads Firebase after the startup check, then
   * `session.get` for a signed-in user. `noAccess` has already signed out of
   * Firebase and left state 4's notice; a 401 or the 7-day limit signs out
   * with "Your session ended". Server and network failures reject without
   * signing anyone out.
   */
  ensure(): Promise<SessionState>;
  signInWithGoogle(options: GoogleSignInOptions): Promise<SignInResult>;
  /** Called by the Login page when it returns from a redirect sign-in. */
  completeRedirect(): Promise<SignInResult>;
  /** Development builds only: Playwright's test sign-in (SI-17). */
  signInWithCustomToken(token: string): Promise<SignInResult>;
  /**
   * Sign out of this browser (AU-04): cancels queries, clears the cache and
   * signs out of Firebase. The caller then goes to /login.
   */
  signOut(): Promise<void>;
  /** The tRPC link's headers: the ID token and the active Organization. */
  requestHeaders(): Promise<Record<string, string>>;
  /** The QueryCache's and MutationCache's error handler. */
  handleRequestError(error: unknown): void;
  // Function properties: React's useSyncExternalStore receives them detached.
  getNotice: () => LoginNotice | null;
  subscribeNotice: (listener: () => void) => () => void;
  clearNotice(): void;
  connectRouter(router: GuardedRouter): void;
}

export function createSession(dependencies: SessionDependencies): Session {
  const { queryClient } = dependencies;
  const now = dependencies.now ?? Date.now;
  const sessionQueryKey = trpc.session.get.queryKey();

  let router: GuardedRouter | undefined;
  let loading: Promise<AuthPort> | undefined;
  let port: AuthPort | undefined;
  // The uid Firebase reported last; null when signed out, undefined before
  // Firebase loads. Set before this tab signs out, so Firebase's own
  // notification of that sign-out changes nothing.
  let knownUid: string | null | undefined;
  // AU-03 check 2: the session's `auth_time`, from the startup check or the
  // token received at sign-in.
  let remembered: { uid: string; authTime: number } | undefined;
  let member: MemberSession | undefined;
  let resolving: Promise<SessionState> | undefined;
  let ending: Promise<void> | undefined;
  let completing: Promise<SignInResult> | undefined;
  let notice: LoginNotice | null = null;
  const noticeListeners = new Set<() => void>();

  function setNotice(next: LoginNotice | null): void {
    notice = next;
    for (const listener of noticeListeners) {
      listener();
    }
  }

  function forget(): void {
    knownUid = null;
    remembered = undefined;
    member = undefined;
  }

  async function signOutHere(): Promise<void> {
    forget();
    await queryClient.cancelQueries();
    queryClient.clear();
    await port?.signOut();
  }

  // A sign-in or sign-out this tab didn't start: another tab, a popup or the
  // development hook. Drop the previous person's data and let the guards
  // decide where the page goes.
  function onUserChange(user: AuthUser | null): void {
    const uid = user?.uid ?? null;
    if (uid === knownUid) {
      return;
    }
    knownUid = uid;
    remembered = undefined;
    member = undefined;
    void queryClient.cancelQueries();
    queryClient.clear();
    void router?.invalidate();
  }

  function load(): Promise<AuthPort> {
    loading ??= (async () => {
      const saved = await dependencies.checkSavedSession();
      if (saved.status === "ended") {
        setNotice({ kind: "sessionEnded" });
      } else if (saved.status === "valid") {
        remembered = { uid: saved.uid, authTime: saved.authTime };
      }
      const loaded = await dependencies.loadAuth();
      await loaded.ready();
      knownUid = loaded.currentUser()?.uid ?? null;
      loaded.onUserChange(onUserChange);
      port = loaded;
      return loaded;
    })().catch((error: unknown) => {
      // A failed chunk load or startup check can be retried.
      loading = undefined;
      throw error;
    });
    return loading;
  }

  async function authTimeOf(user: AuthUser, auth: AuthPort): Promise<number> {
    if (remembered?.uid === user.uid) {
      return remembered.authTime;
    }
    // Right after a sign-in the token is fresh, so this makes no request.
    const authTime = tokenAuthTime(await auth.idToken());
    if (authTime === undefined) {
      throw new Error("The ID token has no auth_time.");
    }
    remembered = { uid: user.uid, authTime };
    return authTime;
  }

  function invalidateRoutes(): void {
    void router?.invalidate();
  }

  // "Your session ended" (AU-03, SI-12): the guards run again and send the
  // page to /login. A guard run in progress finishes first, because it may be
  // the one that called this, and it already answers `signedOut`.
  function end(): Promise<void> {
    ending ??= (async () => {
      setNotice({ kind: "sessionEnded" });
      await signOutHere();
      void (resolving ?? Promise.resolve(signedOut)).then(
        invalidateRoutes,
        invalidateRoutes,
      );
    })().finally(() => {
      ending = undefined;
    });
    return ending;
  }

  async function resolve(retried = false): Promise<SessionState> {
    const auth = await load();
    const user = auth.currentUser();
    if (user === null) {
      return signedOut;
    }
    const authTime = await authTimeOf(user, auth);
    if (isPastLimit(authTime, now())) {
      await end();
      return signedOut;
    }
    let answer: SessionAnswer;
    try {
      answer = await queryClient.fetchQuery({
        queryKey: sessionQueryKey,
        queryFn: () => dependencies.fetchSession(),
        staleTime: Number.POSITIVE_INFINITY,
      });
    } catch (error) {
      if (errorCodeOf(error) === "UNAUTHORIZED") {
        await end();
        return signedOut;
      }
      // Another tab signed in or out meanwhile, and its change cancelled
      // this request: answer for the browser's current user instead.
      if (isCancelledError(error) && !retried) {
        return resolve(true);
      }
      throw error;
    }
    if (answer.status === "noAccess") {
      // AU-10: sign out of Firebase first, so no session lingers.
      await signOutHere();
      setNotice({ kind: "noAccess", email: user.email });
      return { status: "noAccess" };
    }
    member = memberSession(answer);
    return { status: "member", member };
  }

  // A sign-in this tab made. Firebase notifies its listeners asynchronously;
  // if that hasn't happened yet, the sign-in is adopted here, and the later
  // notification changes nothing, so it can't clear the cache while the
  // session loads. A member goes on through the Login page's guard; for
  // `noAccess` the page shows state 4.
  async function afterSignIn(auth: AuthPort): Promise<SignInResult> {
    const uid = auth.currentUser()?.uid ?? null;
    if (uid !== knownUid) {
      knownUid = uid;
      remembered = undefined;
      member = undefined;
    }
    const state = await session.ensure();
    if (state.status === "member") {
      invalidateRoutes();
    }
    return state.status === "signedOut"
      ? { status: "failed", failure: "other" }
      : { status: state.status };
  }

  async function redirect(
    auth: AuthPort,
    options: GoogleSignInOptions,
  ): Promise<SignInResult> {
    markRedirecting();
    await auth.signInWithRedirect(options);
    return { status: "redirecting" };
  }

  const session: Session = {
    ensure() {
      resolving ??= resolve().finally(() => {
        resolving = undefined;
      });
      return resolving;
    },

    async signInWithGoogle(options) {
      const auth = await load();
      setNotice(null);
      const context = dependencies.signInContext();
      if (chooseSignInMethod(context) === "redirect") {
        return redirect(auth, options);
      }
      try {
        await auth.signInWithPopup(options);
      } catch (error) {
        const failure = signInFailure(error);
        if (failure === "popupBlocked" && canRedirect(context)) {
          return redirect(auth, options);
        }
        return { status: "failed", failure };
      }
      return afterSignIn(auth);
    },

    completeRedirect() {
      // Once per page: React's StrictMode runs the Login page's effect twice
      // in development.
      completing ??= (async (): Promise<SignInResult> => {
        const auth = await load();
        try {
          await auth.completeRedirect();
        } catch (error) {
          return { status: "failed", failure: signInFailure(error) };
        } finally {
          clearRedirecting();
        }
        if (auth.currentUser() === null) {
          return { status: "failed", failure: "cancelled" };
        }
        return afterSignIn(auth);
      })();
      return completing;
    },

    async signInWithCustomToken(token) {
      const auth = await load();
      setNotice(null);
      await auth.signInWithCustomToken(token);
      return afterSignIn(auth);
    },

    async signOut() {
      setNotice(null);
      await signOutHere();
    },

    async requestHeaders() {
      const user = port?.currentUser() ?? null;
      if (port === undefined || user === null) {
        return {};
      }
      // AU-03 check 2: past the limit, sign out instead of refreshing.
      if (
        remembered?.uid === user.uid &&
        isPastLimit(remembered.authTime, now())
      ) {
        void end();
        throw new SessionEndedError();
      }
      const headers: Record<string, string> = {
        authorization: `Bearer ${await port.idToken()}`,
      };
      if (member !== undefined) {
        headers["x-organization-id"] = String(member.organization.id);
      }
      return headers;
    },

    handleRequestError(error) {
      const code = errorCodeOf(error);
      if (code === "UNAUTHORIZED") {
        void end();
      } else if (code === "FORBIDDEN") {
        // A Membership may be gone (AU-12 case 15): load the session again,
        // and the guard shows the page or state 4.
        queryClient.removeQueries({ queryKey: sessionQueryKey });
        member = undefined;
        void router?.invalidate();
      }
    },

    getNotice: () => notice,

    subscribeNotice(listener) {
      noticeListeners.add(listener);
      return () => {
        noticeListeners.delete(listener);
      };
    },

    clearNotice() {
      setNotice(null);
    },

    connectRouter(next) {
      router = next;
    },
  };
  return session;
}
