import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Opt-in parity-stack smoke suite (owner-approved 2026-10-31, R10). It needs
// Docker, stays outside `pnpm check` and always removes its Compose project.
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  test: {
    name: "api-stack",
    environment: "node",
    include: ["tests/**/*.smoke.test.ts"],
    testTimeout: 60_000,
    // A first build may download the base image and every dependency.
    hookTimeout: 900_000,
    fileParallelism: false,
    retry: 0,
    passWithNoTests: false,
  },
});
