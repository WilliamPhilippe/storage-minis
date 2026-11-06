import { describe, expect, it, vi } from "vitest";
import {
  createFakeAuth,
  type FakeUser,
  memberAnswer,
  outsiderUser,
  ownerUser,
  secondsAgo,
} from "../../test/fakeAuth";
import { errorResponse, jsonResponse } from "../../test/renderApp";
import { connectSession, createQueryClient, trpc, trpcClient } from "../trpc";
import type { SavedSession } from "./savedSession";
import {
  createSession,
  type SessionAnswer,
  SessionEndedError,
} from "./session";
import type { SignInContext } from "./signInMethod";

type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

function flush(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function setup(
  options: {
    user?: FakeUser | null;
    saved?: SavedSession;
    fetchSession?: () => Promise<SessionAnswer>;
    now?: () => number;
    context?: Partial<SignInContext>;
  } = {},
) {
  const queryClient = createQueryClient({ retryDelay: 0 });
  const user = options.user === undefined ? ownerUser() : options.user;
  const auth = createFakeAuth(user);
  const router = { invalidate: vi.fn(() => Promise.resolve()) };
  const saved: SavedSession =
    options.saved ??
    (user === null
      ? { status: "none" }
      : { status: "valid", uid: user.uid, authTime: user.authTime });
  const order: string[] = [];
  const checkSavedSession = vi.fn(() => {
    order.push("check");
    return Promise.resolve(saved);
  });
  const loadAuth = vi.fn(() => {
    order.push("load");
    return Promise.resolve(auth.port);
  });
  const fetchSession = vi.fn(
    options.fetchSession ?? (() => Promise.resolve(memberAnswer())),
  );
  const session = createSession({
    queryClient,
    checkSavedSession,
    loadAuth,
    fetchSession,
    signInContext: () => ({
      authDomain: "storage-minis-dev.firebaseapp.com",
      host: "localhost:5173",
      coarsePointer: false,
      ...options.context,
    }),
    ...(options.now === undefined ? {} : { now: options.now }),
  });
  session.connectRouter(router);
  connectSession(session);
  return { session, auth, router, queryClient, order, loadAuth, fetchSession };
}

// session.get through the real tRPC client, so its errors carry the envelope.
function fetchThroughApi(response: () => Response) {
  const fetchMock = vi.fn<Fetch>(() => Promise.resolve(response()));
  vi.stubGlobal("fetch", fetchMock);
  return { fetchMock, fetchSession: () => trpcClient.session.get.query() };
}

const options = { language: "en-US", selectAccount: false };

describe("loading the session (the guards' check)", () => {
  it("runs the startup check before Firebase loads, once per page", async () => {
    const { session, order, loadAuth } = setup({ user: null });
    expect(await session.ensure()).toEqual({ status: "signedOut" });
    await session.ensure();
    expect(order).toEqual(["check", "load"]);
    expect(loadAuth).toHaveBeenCalledTimes(1);
  });

  it("answers a member with the active Organization", async () => {
    const answer = memberAnswer();
    if (answer.status !== "member") throw new Error("member expected");
    const { session } = setup({ fetchSession: () => Promise.resolve(answer) });
    const state = await session.ensure();
    expect(state).toEqual({
      status: "member",
      member: {
        user: answer.user,
        memberships: answer.memberships,
        organization: {
          id: 7,
          name: "Test Garage",
          nickname: "test-garage",
          currency: "BRL",
        },
        role: "owner",
      },
    });
  });

  it("picks the lowest Organization ID while a User has several (W5)", async () => {
    const answer = memberAnswer();
    if (answer.status !== "member") throw new Error("member expected");
    const other = {
      role: "viewer" as const,
      organization: {
        id: 3,
        name: "Other",
        nickname: "other",
        currency: "USD" as const,
      },
    };
    const { session } = setup({
      fetchSession: () =>
        Promise.resolve({
          ...answer,
          memberships: [...answer.memberships, other],
        }),
    });
    const state = await session.ensure();
    expect(state.status === "member" && state.member.organization.id).toBe(3);
    expect(state.status === "member" && state.member.role).toBe("viewer");
  });

  it("loads session.get once, then answers from the cache", async () => {
    const { session, fetchSession } = setup();
    await Promise.all([session.ensure(), session.ensure()]);
    await session.ensure();
    expect(fetchSession).toHaveBeenCalledTimes(1);
  });

  it("signs a Google account without access out first (AU-10, case 4)", async () => {
    const { session, auth } = setup({
      user: outsiderUser(),
      fetchSession: () => Promise.resolve({ status: "noAccess" }),
    });
    expect(await session.ensure()).toEqual({ status: "noAccess" });
    expect(auth.port.signOut).toHaveBeenCalledTimes(1);
    expect(auth.port.currentUser()).toBeNull();
    expect(session.getNotice()).toEqual({
      kind: "noAccess",
      email: "outsider@example.com",
    });
  });

  it("ends the session on a 401 from session.get", async () => {
    const { fetchSession } = fetchThroughApi(() =>
      errorResponse(401, "UNAUTHORIZED", "Unauthorized"),
    );
    const { session, auth, router } = setup({ fetchSession });
    expect(await session.ensure()).toEqual({ status: "signedOut" });
    expect(auth.port.signOut).toHaveBeenCalledTimes(1);
    expect(session.getNotice()).toEqual({ kind: "sessionEnded" });
    await flush();
    expect(router.invalidate).toHaveBeenCalled();
  });

  it("never signs out on a 500: the guard shows its error (Google outages)", async () => {
    const { fetchMock, fetchSession } = fetchThroughApi(() =>
      errorResponse(500, "INTERNAL_SERVER_ERROR", "Internal server error"),
    );
    const { session, auth } = setup({ fetchSession });
    await expect(session.ensure()).rejects.toThrow();
    // The first request and TanStack's three retries.
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(auth.port.signOut).not.toHaveBeenCalled();
    expect(session.getNotice()).toBeNull();
  });

  it("signs out past the 7-day limit without a request (AU-12 case 11)", async () => {
    const { session, auth, fetchSession } = setup({
      user: ownerUser(secondsAgo(604_801)),
    });
    expect(await session.ensure()).toEqual({ status: "signedOut" });
    expect(fetchSession).not.toHaveBeenCalled();
    expect(auth.port.idToken).not.toHaveBeenCalled();
    expect(auth.port.signOut).toHaveBeenCalledTimes(1);
    expect(session.getNotice()).toEqual({ kind: "sessionEnded" });
  });

  it("keeps a session of exactly 7 days", async () => {
    const authTime = secondsAgo(604_800);
    const { session } = setup({
      user: ownerUser(authTime),
      now: () => authTime * 1000 + 604_800_000,
    });
    expect((await session.ensure()).status).toBe("member");
  });

  it("says the session ended when the startup check deleted it (case 10)", async () => {
    const { session } = setup({ user: null, saved: { status: "ended" } });
    expect(await session.ensure()).toEqual({ status: "signedOut" });
    expect(session.getNotice()).toEqual({ kind: "sessionEnded" });
  });

  it("can load Firebase again after a failed load", async () => {
    const { session, loadAuth } = setup({ user: null });
    loadAuth.mockRejectedValueOnce(new TypeError("Failed to fetch module"));
    await expect(session.ensure()).rejects.toThrow("Failed to fetch module");
    expect(await session.ensure()).toEqual({ status: "signedOut" });
  });
});

describe("request headers (the tRPC link)", () => {
  it("adds nothing, and loads nothing, before a route loads the session", async () => {
    const { session, loadAuth } = setup();
    expect(await session.requestHeaders()).toEqual({});
    expect(loadAuth).not.toHaveBeenCalled();
  });

  it("sends the ID token and the active Organization through the link", async () => {
    const { session, auth } = setup();
    await session.ensure();
    const fetchMock = vi.fn<Fetch>(() =>
      Promise.resolve(
        jsonResponse(200, { result: { data: { message: "ok" } } }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    await trpcClient.diagnostics.echo.query({ message: "ok" });
    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(headers.get("authorization")).toMatch(
      /^Bearer [\w-]+\.[\w-]+\.signature$/,
    );
    expect(headers.get("x-organization-id")).toBe("7");
    expect(auth.port.idToken).toHaveBeenCalled();
  });

  it("sends no Organization header without a member session", async () => {
    const { session } = setup({
      user: outsiderUser(),
      fetchSession: () => Promise.resolve({ status: "noAccess" }),
    });
    await session.ensure();
    expect(await session.requestHeaders()).toEqual({});
  });

  it("signs out instead of refreshing once the 7 days pass in an open tab (case 11)", async () => {
    const authTime = secondsAgo(3600);
    let now = authTime * 1000 + 3_600_000;
    const { session, auth } = setup({
      user: ownerUser(authTime),
      now: () => now,
    });
    await session.ensure();
    now = authTime * 1000 + 604_801_000;
    auth.port.idToken.mockClear();
    await expect(session.requestHeaders()).rejects.toBeInstanceOf(
      SessionEndedError,
    );
    expect(auth.port.idToken).not.toHaveBeenCalled();
    await flush();
    expect(auth.port.signOut).toHaveBeenCalledTimes(1);
    expect(session.getNotice()).toEqual({ kind: "sessionEnded" });
  });
});

describe("request errors", () => {
  it("signs out with 'Your session ended' on UNAUTHORIZED", async () => {
    const { session, auth, router, queryClient } = setup();
    await session.ensure();
    const fetchMock = vi.fn<Fetch>(() =>
      Promise.resolve(errorResponse(401, "UNAUTHORIZED", "Unauthorized")),
    );
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      queryClient.fetchQuery(
        trpc.diagnostics.echo.queryOptions({ message: "x" }),
      ),
    ).rejects.toThrow();
    // No retry for a 4xx.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await flush();
    expect(auth.port.signOut).toHaveBeenCalledTimes(1);
    expect(session.getNotice()).toEqual({ kind: "sessionEnded" });
    expect(router.invalidate).toHaveBeenCalled();
    expect(queryClient.getQueryCache().getAll()).toEqual([]);
  });

  it("reloads the session on FORBIDDEN, without signing out (case 15)", async () => {
    const { session, auth, router, queryClient, fetchSession } = setup();
    await session.ensure();
    vi.stubGlobal(
      "fetch",
      vi.fn<Fetch>(() =>
        Promise.resolve(errorResponse(403, "FORBIDDEN", "Forbidden")),
      ),
    );
    await expect(
      queryClient.fetchQuery(
        trpc.diagnostics.echo.queryOptions({ message: "x" }),
      ),
    ).rejects.toThrow();
    expect(router.invalidate).toHaveBeenCalledTimes(1);
    expect(auth.port.signOut).not.toHaveBeenCalled();
    fetchSession.mockResolvedValueOnce({ status: "noAccess" });
    expect(await session.ensure()).toEqual({ status: "noAccess" });
    expect(fetchSession).toHaveBeenCalledTimes(2);
  });

  it("ignores server errors and failures without an envelope", async () => {
    const { session, auth, router } = setup();
    await session.ensure();
    session.handleRequestError(new TypeError("Failed to fetch"));
    session.handleRequestError(undefined);
    expect(router.invalidate).not.toHaveBeenCalled();
    expect(auth.port.signOut).not.toHaveBeenCalled();
  });
});

describe("sign-in and sign-out", () => {
  it("signs in with a popup, then lets the Login page's guard send the member on", async () => {
    const { session, auth, router } = setup({ user: null });
    await session.ensure();
    expect(
      await session.signInWithGoogle({
        language: "pt-BR",
        selectAccount: true,
      }),
    ).toEqual({
      status: "member",
    });
    expect(auth.port.signInWithPopup).toHaveBeenCalledWith({
      language: "pt-BR",
      selectAccount: true,
    });
    expect(router.invalidate).toHaveBeenCalled();
  });

  it("answers noAccess after a sign-in without a Membership, signed out", async () => {
    const { session, auth } = setup({
      user: null,
      fetchSession: () => Promise.resolve({ status: "noAccess" }),
    });
    auth.setGoogleUser(outsiderUser());
    expect(await session.signInWithGoogle(options)).toEqual({
      status: "noAccess",
    });
    expect(auth.port.currentUser()).toBeNull();
    expect(session.getNotice()).toEqual({
      kind: "noAccess",
      email: "outsider@example.com",
    });
  });

  it.each([
    ["auth/popup-closed-by-user", "cancelled"],
    ["auth/network-request-failed", "network"],
    ["auth/popup-blocked", "popupBlocked"],
    ["auth/internal-error", "other"],
  ])("reports a popup failure (%s)", async (code, failure) => {
    const { session, auth } = setup({ user: null });
    auth.port.signInWithPopup.mockRejectedValueOnce({ code });
    expect(await session.signInWithGoogle(options)).toEqual({
      status: "failed",
      failure,
    });
    expect(auth.port.signInWithRedirect).not.toHaveBeenCalled();
  });

  it("falls back to redirect for a blocked popup where redirect is allowed (case 24)", async () => {
    const { session, auth } = setup({
      user: null,
      context: { authDomain: "app.example.com", host: "app.example.com" },
    });
    auth.port.signInWithPopup.mockRejectedValueOnce({
      code: "auth/popup-blocked",
    });
    expect(await session.signInWithGoogle(options)).toEqual({
      status: "redirecting",
    });
    expect(auth.port.signInWithRedirect).toHaveBeenCalledWith(options);
    expect(sessionStorage.getItem("storage-minis.redirecting")).toBe("1");
  });

  it("redirects a coarse pointer once authDomain is the page's host", async () => {
    const { session, auth } = setup({
      user: null,
      context: {
        authDomain: "app.example.com",
        host: "app.example.com",
        coarsePointer: true,
      },
    });
    expect(await session.signInWithGoogle(options)).toEqual({
      status: "redirecting",
    });
    expect(auth.port.signInWithPopup).not.toHaveBeenCalled();
    expect(sessionStorage.getItem("storage-minis.redirecting")).toBe("1");
  });

  it("completes a redirect sign-in and clears the flag", async () => {
    sessionStorage.setItem("storage-minis.redirecting", "1");
    const { session, auth } = setup({ user: null });
    expect(await session.completeRedirect()).toEqual({ status: "member" });
    expect(auth.port.completeRedirect).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem("storage-minis.redirecting")).toBeNull();
  });

  it("reports a return from Google without a sign-in as cancelled", async () => {
    sessionStorage.setItem("storage-minis.redirecting", "1");
    const { session, auth } = setup({ user: null });
    auth.port.completeRedirect.mockResolvedValueOnce(undefined);
    expect(await session.completeRedirect()).toEqual({
      status: "failed",
      failure: "cancelled",
    });
    expect(sessionStorage.getItem("storage-minis.redirecting")).toBeNull();
  });

  it("signs in with a custom token (the development hook)", async () => {
    const { session, auth } = setup({ user: null });
    expect(await session.signInWithCustomToken("custom-token")).toEqual({
      status: "member",
    });
    expect(auth.port.signInWithCustomToken).toHaveBeenCalledWith(
      "custom-token",
    );
  });

  it("signs out of this browser: cancels, clears and signs out of Firebase (AU-04)", async () => {
    const { session, auth, router, queryClient } = setup();
    await session.ensure();
    expect(queryClient.getQueryCache().getAll()).not.toEqual([]);
    await session.signOut();
    await flush();
    expect(auth.port.signOut).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryCache().getAll()).toEqual([]);
    // The caller goes to /login; Firebase's own notification changes nothing.
    expect(router.invalidate).not.toHaveBeenCalled();
    expect(await session.requestHeaders()).toEqual({});
  });
});

describe("another tab of the same browser", () => {
  it("signing out clears this tab's cache and runs the guards (case 12)", async () => {
    const { session, auth, router, queryClient } = setup();
    await session.ensure();
    auth.setUser(null);
    await flush();
    expect(queryClient.getQueryCache().getAll()).toEqual([]);
    expect(router.invalidate).toHaveBeenCalledTimes(1);
    expect(await session.ensure()).toEqual({ status: "signedOut" });
    expect(await session.requestHeaders()).toEqual({});
  });

  it("signing in runs the guards here too", async () => {
    const { session, auth, router } = setup({ user: null });
    await session.ensure();
    auth.setUser(ownerUser());
    await flush();
    expect(router.invalidate).toHaveBeenCalledTimes(1);
    expect((await session.ensure()).status).toBe("member");
  });

  it("Firebase's first notification of the loaded user changes nothing", async () => {
    const { session, router } = setup();
    await session.ensure();
    await flush();
    expect(router.invalidate).not.toHaveBeenCalled();
  });
});
