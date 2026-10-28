import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { readDatabaseConfig } from "../src/config.js";
import { formatDatabaseError } from "../src/diagnostics.js";
import {
  migrationHistory,
  requireMigrationArtifacts,
} from "../src/migrations.js";

// Run in the supervised child so signals/deadlines retain their existing bounds.
// Kit uses this same native migrator, but its progress renderer drops failures.
let pool: Pool | undefined;
try {
  const folder = fileURLToPath(new URL("../drizzle", import.meta.url));
  requireMigrationArtifacts(folder);
  const config = readDatabaseConfig(process.env);
  pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: false,
    max: 1,
    connectionTimeoutMillis: 2_000,
    // pg reads the supervisor's PGOPTIONS on the actual migration connection.
  });
  await migrate(drizzle(pool), {
    migrationsFolder: folder,
    migrationsSchema: migrationHistory.schema,
    migrationsTable: migrationHistory.table,
  });
} catch (error) {
  console.error("Migration runner failed.", formatDatabaseError(error));
  process.exitCode = 1;
} finally {
  try {
    await pool?.end();
  } catch (error) {
    console.error("Migration cleanup failed.", formatDatabaseError(error));
    process.exitCode = 1;
  }
}
