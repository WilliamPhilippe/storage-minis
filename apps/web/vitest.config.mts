import { fileURLToPath } from "node:url";
import { defineProject } from "vitest/config";

// No React plugin: Vite 8 compiles JSX for tests.
export default defineProject({
  root: fileURLToPath(new URL(".", import.meta.url)),
  test: {
    name: "web-unit",
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    globals: false,
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
    isolate: true,
    retry: 0,
    setupFiles: ["./src/test/setup.ts"],
    // The default `forks` pool applies this; `threads` would not.
    env: { TZ: "America/Sao_Paulo" },
  },
});
