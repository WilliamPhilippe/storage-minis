import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { readDatabaseConfig, requireTestDatabase } from "./src/config.js";

requireTestDatabase(readDatabaseConfig(process.env));

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  test: {
    name: "db-integration",
    environment: "node",
    include: ["tests/**/*.integration.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 10_000,
    fileParallelism: false,
    retry: 0,
    passWithNoTests: false,
  },
});
