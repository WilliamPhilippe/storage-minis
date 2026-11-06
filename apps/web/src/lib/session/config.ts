// The Firebase web config from Vite's mode files (sign-in plan SI-03), which
// vite.config.mts checks when Vite starts. Public identifiers (W10). No
// measurementId: the app never loads Analytics.
export interface FirebaseWebConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly appId: string;
}

export function firebaseWebConfig(): FirebaseWebConfig {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}
