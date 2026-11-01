// Migration entry point: `node dist/migrate.js`. Applies pending committed
// migrations as the owner role named by MIGRATION_DATABASE_URL (D6). The API
// image runs the same compiled file in the `migrate` Compose service; the API
// itself never migrates. Not exported from the package index: importing this
// module runs the migration.
//
// It calls Drizzle's native migrator directly because Drizzle Kit 0.31.11's
// progress renderer exits without printing migration errors (approved
// 2026-10-25). Lock and statement timeouts are set on the migration connection;
// there is no wrapping process supervisor (approved 2026-10-31, Section 9).
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { connectionOptions } from "./client.js";
import { readDatabaseConfig } from "./config.js";
import { formatDatabaseError } from "./diagnostics.js";
import {
  migrationHistory,
  migrationLimits,
  requireMigrationArtifacts,
} from "./migrations.js";

const migrationsFolder = fileURLToPath(new URL("../drizzle", import.meta.url));
let password: string | undefined;
let pool: Pool | undefined;
try {
  requireMigrationArtifacts(migrationsFolder);
  const config = readDatabaseConfig(process.env, "MIGRATION_DATABASE_URL");
  password = config.password;
  pool = new Pool({
    ...connectionOptions(config),
    application_name: "storage-minis-migrate",
    max: 1,
    connectionTimeoutMillis: migrationLimits.connectMs,
    lock_timeout: migrationLimits.lockMs,
    statement_timeout: migrationLimits.statementMs,
    idle_in_transaction_session_timeout: migrationLimits.statementMs,
  });
  await migrate(drizzle({ client: pool }), {
    migrationsFolder,
    migrationsSchema: migrationHistory.schema,
    migrationsTable: migrationHistory.table,
  });
  console.log(
    "Database migrations applied; already-applied migrations were skipped.",
  );
} catch (error) {
  console.error(
    "Database migration failed. Inspect drizzle.__drizzle_migrations before retrying an interrupted run.",
    formatDatabaseError(error, password),
  );
  process.exitCode = 1;
} finally {
  try {
    await pool?.end();
  } catch (error) {
    console.error(
      "Database migration cleanup failed.",
      formatDatabaseError(error, password),
    );
    process.exitCode = 1;
  }
}
