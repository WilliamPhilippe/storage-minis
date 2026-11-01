import { fileURLToPath } from "node:url";
import { defineConfig } from "drizzle-kit";
import { migrationHistory } from "./src/migrations.js";

// Single Drizzle Kit configuration (approved 2026-10-31). `drizzle-kit
// generate` is offline. MIGRATION_DATABASE_URL is read only when set, for Kit
// commands that connect (for example `studio`); the project applies migrations
// with src/migrate.ts.
const url = process.env.MIGRATION_DATABASE_URL;

export default defineConfig({
  dialect: "postgresql",
  schema: fileURLToPath(new URL("./src/schema/index.ts", import.meta.url)),
  // Kit 0.31.11 prepends './' when reopening snapshots, so keep this relative
  // and run Kit from the package directory (package scripts do).
  out: "./drizzle",
  migrations: migrationHistory,
  ...(url ? { dbCredentials: { url } } : {}),
});
