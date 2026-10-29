import { fileURLToPath } from "node:url";
import { readDatabaseConfig, requireTestDatabase } from "@storage-minis/db";
import { defineConfig } from "vitest/config";

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
