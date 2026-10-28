import { runDrizzleCommand } from "./drizzle-command.js";
import { formatDatabaseError } from "../src/diagnostics.js";

try {
  await runDrizzleCommand("generate", process.argv.slice(2));
} catch (error) {
  console.error(
    "Migration generation failed. Review the schema and Drizzle diagnostics.",
    formatDatabaseError(error),
  );
  process.exitCode = 1;
}
