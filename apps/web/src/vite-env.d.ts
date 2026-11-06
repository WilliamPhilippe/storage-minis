// The web config from Vite's mode files (sign-in plan SI-03), which
// vite.config.mts checks when Vite starts. `strictImportMetaEnv` makes any
// other `import.meta.env.VITE_*` name a type error.
interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
