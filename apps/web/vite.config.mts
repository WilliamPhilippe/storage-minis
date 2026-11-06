import { fileURLToPath } from "node:url";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { z } from "zod";

const root = fileURLToPath(new URL(".", import.meta.url));

// The Firebase web config from Vite's mode files, apps/web/.env.development
// and .env.production (sign-in plan SI-03): public identifiers, checked
// whenever Vite serves, builds or previews, so a missing or malformed value
// stops `pnpm dev` and `pnpm build`. Unknown VITE_FIREBASE_* names are
// refused too, so no measurementId (Analytics) slips in.
const firebaseConfig = z.strictObject({
  VITE_FIREBASE_API_KEY: z.string().regex(/^AIza[0-9A-Za-z_-]{35}$/),
  // A host name; PR 4 sets the app's own domain in production (SI-18).
  VITE_FIREBASE_AUTH_DOMAIN: z
    .string()
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/),
  // Google Cloud's project ID format, as the API checks FIREBASE_PROJECT_ID.
  VITE_FIREBASE_PROJECT_ID: z.string().regex(/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/),
  VITE_FIREBASE_APP_ID: z.string().regex(/^[0-9]+:[0-9]+:web:[0-9a-f]+$/),
});

// Messages name variables, never values.
function checkFirebaseConfig(mode: string): void {
  const result = firebaseConfig.safeParse(
    loadEnv(mode, root, "VITE_FIREBASE_"),
  );
  if (result.success) {
    return;
  }
  const names = new Set(
    result.error.issues.flatMap((issue) =>
      issue.code === "unrecognized_keys"
        ? issue.keys
        : issue.path.map((key) => String(key)),
    ),
  );
  throw new Error(
    `Invalid web configuration. Check ${[...names].join(", ")} in apps/web/.env.${mode}.`,
  );
}

export default defineConfig(({ mode }) => {
  checkFirebaseConfig(mode);
  return {
    root,
    plugins: [
      // TanStack requires the router plugin before the React plugin. The quote
      // and semicolon options make the files it writes match Prettier.
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
        quoteStyle: "double",
        semicolons: true,
      }),
      react(),
    ],
    server: {
      host: "127.0.0.1",
      port: 5173,
      strictPort: true,
      // Trailing slash: Vite matches by prefix, so "/trpc" would also proxy
      // "/trpcx". `vite preview` reuses this proxy.
      proxy: { "/trpc/": "http://127.0.0.1:3000" },
    },
    preview: { host: "127.0.0.1", port: 4173, strictPort: true },
  };
});
