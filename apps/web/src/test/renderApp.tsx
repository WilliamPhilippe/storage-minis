import { QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { render } from "@testing-library/react";
import type { SavedSession } from "../lib/session/savedSession";
import { createSession, type SessionAnswer } from "../lib/session/session";
import type { SignInContext } from "../lib/session/signInMethod";
import { connectSession, createQueryClient } from "../lib/trpc";
import { createAppRouter } from "../router";
import { AppProviders } from "../ui/AppProviders";
import {
  createFakeAuth,
  type FakeUser,
  memberAnswer,
  ownerUser,
} from "./fakeAuth";

export interface RenderOptions {
  /** The browser's Firebase user; null when signed out. A member by default. */
  readonly user?: FakeUser | null;
  /** `session.get`; the member session by default, without a request. */
  readonly fetchSession?: () => Promise<SessionAnswer>;
  /** The startup check's result; by default it matches `user`. */
  readonly savedSession?: SavedSession;
  readonly signInContext?: Partial<SignInContext>;
  readonly now?: () => number;
}

/** Development: popup, because authDomain isn't the page's host. */
export const devSignInContext: SignInContext = {
  authDomain: "storage-minis-dev.firebaseapp.com",
  host: "localhost:5173",
  coarsePointer: false,
};

// The real route tree at `path`, with a memory history, a fresh QueryClient
// whose retries don't wait, and the real session layer over a fake Firebase.
export function renderApp(path: string, options: RenderOptions = {}) {
  const queryClient = createQueryClient({ retryDelay: 0 });
  const user = options.user === undefined ? ownerUser() : options.user;
  const auth = createFakeAuth(user);
  const savedSession: SavedSession =
    options.savedSession ??
    (user === null
      ? { status: "none" }
      : { status: "valid", uid: user.uid, authTime: user.authTime });
  const session = createSession({
    queryClient,
    checkSavedSession: () => Promise.resolve(savedSession),
    loadAuth: () => Promise.resolve(auth.port),
    fetchSession:
      options.fetchSession ?? (() => Promise.resolve(memberAnswer())),
    signInContext: () => ({ ...devSignInContext, ...options.signInContext }),
    ...(options.now === undefined ? {} : { now: options.now }),
  });
  connectSession(session);
  const router = createAppRouter({
    queryClient,
    session,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  session.connectRouter(router);
  const view = render(
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </QueryClientProvider>,
  );
  return { ...view, router, queryClient, session, auth };
}

export function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** A tRPC error envelope, as the API sends it. */
export function errorResponse(
  status: number,
  code: string,
  message: string,
): Response {
  return jsonResponse(status, {
    error: { message, code: -32000, data: { code, httpStatus: status } },
  });
}

// The API's reply to diagnostics.echo({ message: "ping" }).
export function echoResponse(): Response {
  return jsonResponse(200, { result: { data: { message: "ping" } } });
}
