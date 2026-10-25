import { fileURLToPath } from "node:url";
import { readDatabaseConfig } from "../src/config.js";
import { requireMigrationArtifacts } from "../src/migrations.js";
import { runDrizzleCommand } from "./drizzle-command.js";

try {
  requireMigrationArtifacts(
    fileURLToPath(new URL("../drizzle", import.meta.url)),
  );
  readDatabaseConfig(process.env);
  await runDrizzleCommand("migrate");
} catch {
  console.error(
    "Migration application failed. Verify reviewed artifacts, explicit target, credentials and availability. Inspect migration history before retrying an interrupted command.",
  );
  process.exitCode = 1;
}
