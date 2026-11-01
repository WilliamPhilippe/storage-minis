import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Committed local test values (R3/R9). Node's loader keeps any value already
// set in the real environment, which therefore takes precedence.
const testValues = fileURLToPath(new URL("../../.env.test", import.meta.url));
if (existsSync(testValues)) process.loadEnvFile(testValues);

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  test: {
    name: "db-integration",
    environment: "node",
    include: ["tests/**/*.integration.test.ts"],
    // Refuses non-*_test databases before connecting, then resets and migrates.
    globalSetup: ["tests/global-setup.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
    retry: 0,
    passWithNoTests: false,
  },
});
