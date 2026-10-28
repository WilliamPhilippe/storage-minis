import { fileURLToPath } from "node:url";
import { readDatabaseConfig } from "../src/config.js";
import { requireMigrationArtifacts } from "../src/migrations.js";
import { runDrizzleCommand } from "./drizzle-command.js";
import { formatDatabaseError } from "../src/diagnostics.js";

try {
  requireMigrationArtifacts(
    fileURLToPath(new URL("../drizzle", import.meta.url)),
  );
  readDatabaseConfig(process.env);
  await runDrizzleCommand("migrate");
} catch (error) {
  console.error(
    "Migration application failed. Verify reviewed artifacts, explicit target, credentials and availability. Inspect migration history before retrying an interrupted command.",
    formatDatabaseError(error),
  );
  process.exitCode = 1;
}
