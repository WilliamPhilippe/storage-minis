import { fileURLToPath } from "node:url";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
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
});
