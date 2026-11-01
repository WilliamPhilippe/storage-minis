import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { readDatabaseConfig, requireTestDatabase } from "@storage-minis/db";
import { defineConfig } from "vitest/config";

// Committed local test values (R3/R9). Node's loader keeps any value already
// set in the real environment, which therefore takes precedence.
const testValues = fileURLToPath(new URL("../../.env.test", import.meta.url));
if (existsSync(testValues)) process.loadEnvFile(testValues);

// Refuse any database not named *_test before Vitest starts a worker, a child
// process or a connection. A config failure prints its message cleanly.
requireTestDatabase(readDatabaseConfig(process.env));

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  test: {
    name: "api-process",
    environment: "node",
    include: ["tests/**/*.integration.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 10_000,
    fileParallelism: false,
    maxWorkers: 1,
    retry: 0,
    passWithNoTests: false,
  },
});
