// The part of Firebase Authentication the session layer uses (sign-in plan
// SI-09 to SI-12). `firebase.ts` implements it with the Firebase SDK and is
// the only module that imports Firebase; component tests use a fake.

export interface AuthUser {
  readonly uid: string;
  /** The Google account's address; custom-token test users have none. */
  readonly email: string | null;
}

export interface GoogleSignInOptions {
  /** Google's pages follow the app's language. */
  readonly language: string;
  /** "Use another Google account": Google's chooser (`prompt=select_account`). */
  readonly selectAccount: boolean;
}

export interface AuthPort {
  /** Resolves once Firebase has loaded any saved session. */
  ready(): Promise<void>;
  currentUser(): AuthUser | null;
  /**
   * Called with the current user when subscribed, then on every sign-in and
   * sign-out, including those of other tabs of this browser.
   */
  onUserChange(listener: (user: AuthUser | null) => void): () => void;
  /** The signed-in user's ID token, which Firebase refreshes when it expires within 5 minutes. */
  idToken(): Promise<string>;
  signInWithPopup(options: GoogleSignInOptions): Promise<void>;
  /** Leaves the page for Google; the Login page completes it on return. */
  signInWithRedirect(options: GoogleSignInOptions): Promise<void>;
  /** Completes a redirect sign-in; resolves without a user when none was pending. */
  completeRedirect(): Promise<void>;
  /** Playwright's test sign-in (SI-17), reached only through the development hook. */
  signInWithCustomToken(token: string): Promise<void>;
  /** Signs out this browser only (AU-04). */
  signOut(): Promise<void>;
}
