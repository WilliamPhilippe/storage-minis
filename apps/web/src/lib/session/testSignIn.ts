import type { Session } from "./session";

// Playwright's test sign-in (sign-in plan SI-17, T02 AU-11). main.tsx imports
// this module only inside `if (import.meta.env.DEV)`, so production builds
// drop it; the API accepts the custom tokens it signs in with only under
// AUTH_TEST_SIGN_IN, which only .env.test sets.

declare global {
  interface Window {
    /** Development builds only. Resolves with the sign-in's outcome. */
    __storageMinisTest?: { signIn(token: string): Promise<string> };
  }
}

export function installTestSignIn(session: Session): void {
  window.__storageMinisTest = {
    signIn: async (token) =>
      (await session.signInWithCustomToken(token)).status,
  };
}
