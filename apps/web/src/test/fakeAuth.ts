import { vi } from "vitest";
import type {
  AuthPort,
  AuthUser,
  GoogleSignInOptions,
} from "../lib/session/authPort";
import type { SessionAnswer } from "../lib/session/session";

// A stand-in for Firebase Authentication behind the session layer's port, so
// component tests never load Firebase (sign-in plan SI-03: the web-unit
// project doesn't read Vite's mode files).

export interface FakeUser extends AuthUser {
  /** The last Google sign-in, in seconds. */
  readonly authTime: number;
}

function encode(value: object): string {
  return btoa(JSON.stringify(value))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

/** A token shaped like Firebase's: only its `auth_time` claim is read. */
export function fakeIdToken(user: FakeUser): string {
  return `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
    sub: user.uid,
    auth_time: user.authTime,
  })}.signature`;
}

export function secondsAgo(seconds: number): number {
  return Math.floor(Date.now() / 1000) - seconds;
}

/** The signed-in owner of the default member session. */
export function ownerUser(authTime: number = secondsAgo(3600)): FakeUser {
  return { uid: "owner-uid", email: "owner@example.com", authTime };
}

/** A Google account without a User row or Membership. */
export function outsiderUser(): FakeUser {
  return {
    uid: "outsider-uid",
    email: "outsider@example.com",
    authTime: secondsAgo(60),
  };
}

export function memberAnswer(): SessionAnswer {
  return {
    status: "member",
    user: {
      id: 1,
      displayName: "Owner",
      email: "owner@example.com",
      role: "global_admin",
      canEditProducts: true,
    },
    memberships: [
      {
        role: "owner",
        organization: {
          id: 7,
          name: "Test Garage",
          nickname: "test-garage",
          currency: "BRL",
        },
      },
    ],
  };
}

export type FakeAuth = ReturnType<typeof createFakeAuth>;

export function createFakeAuth(initial: FakeUser | null) {
  let user = initial;
  const listeners = new Set<(user: AuthUser | null) => void>();

  function view(current: FakeUser | null): AuthUser | null {
    return current === null ? null : { uid: current.uid, email: current.email };
  }

  // Firebase notifies its listeners asynchronously.
  function setUser(next: FakeUser | null): void {
    user = next;
    queueMicrotask(() => {
      for (const listener of listeners) {
        listener(view(next));
      }
    });
  }

  /** The account the next Google sign-in returns. */
  let googleUser: FakeUser = ownerUser(secondsAgo(0));

  const port = {
    ready: vi.fn(() => Promise.resolve()),
    currentUser: () => view(user),
    onUserChange: (listener: (user: AuthUser | null) => void) => {
      listeners.add(listener);
      const current = user;
      queueMicrotask(() => {
        listener(view(current));
      });
      return () => {
        listeners.delete(listener);
      };
    },
    idToken: vi.fn(() =>
      user === null
        ? Promise.reject(new Error("No user is signed in."))
        : Promise.resolve(fakeIdToken(user)),
    ),
    signInWithPopup: vi.fn((_options: GoogleSignInOptions) => {
      setUser(googleUser);
      return Promise.resolve();
    }),
    signInWithRedirect: vi.fn((_options: GoogleSignInOptions) =>
      Promise.resolve(),
    ),
    completeRedirect: vi.fn(() => {
      setUser(googleUser);
      return Promise.resolve();
    }),
    signInWithCustomToken: vi.fn((_token: string) => {
      setUser(googleUser);
      return Promise.resolve();
    }),
    signOut: vi.fn(() => {
      setUser(null);
      return Promise.resolve();
    }),
  } satisfies AuthPort;

  return {
    port,
    /** A sign-in or sign-out in another tab of the same browser. */
    setUser,
    setGoogleUser(next: FakeUser): void {
      googleUser = next;
    },
  };
}
