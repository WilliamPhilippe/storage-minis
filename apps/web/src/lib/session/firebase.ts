import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getRedirectResult,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  onAuthStateChanged,
  signInWithCustomToken,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";
import type { AuthPort, AuthUser, GoogleSignInOptions } from "./authPort";
import { firebaseWebConfig } from "./config";

// The only module that imports Firebase (sign-in plan SI-09). The session
// layer loads it with import() for /login and /app, after the startup check,
// so the catalog never downloads it.
//
// Local persistence (AU-02): IndexedDB, then localStorage. No
// popupRedirectResolver here: with one, Firebase loads
// https://<authDomain>/__/auth/iframe and Google's api.js at startup on phones
// and Safari. Each sign-in call passes the resolver instead.

function toAuthUser(user: User | null): AuthUser | null {
  return user === null ? null : { uid: user.uid, email: user.email };
}

export function createFirebaseAuth(): AuthPort {
  const auth = initializeAuth(initializeApp(firebaseWebConfig()), {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence],
  });

  function signedInUser(): User {
    const user = auth.currentUser;
    if (user === null) {
      throw new Error("No user is signed in.");
    }
    return user;
  }

  function googleProvider({
    language,
    selectAccount,
  }: GoogleSignInOptions): GoogleAuthProvider {
    auth.languageCode = language;
    const provider = new GoogleAuthProvider();
    if (selectAccount) {
      provider.setCustomParameters({ prompt: "select_account" });
    }
    return provider;
  }

  return {
    ready: () => auth.authStateReady(),
    currentUser: () => toAuthUser(auth.currentUser),
    onUserChange: (listener) =>
      onAuthStateChanged(auth, (user) => {
        listener(toAuthUser(user));
      }),
    idToken: () => signedInUser().getIdToken(),
    signInWithPopup: async (options) => {
      await signInWithPopup(
        auth,
        googleProvider(options),
        browserPopupRedirectResolver,
      );
    },
    signInWithRedirect: (options) =>
      signInWithRedirect(
        auth,
        googleProvider(options),
        browserPopupRedirectResolver,
      ),
    completeRedirect: async () => {
      await getRedirectResult(auth, browserPopupRedirectResolver);
    },
    signInWithCustomToken: async (token) => {
      await signInWithCustomToken(auth, token);
    },
    signOut: () => signOut(auth),
  };
}
