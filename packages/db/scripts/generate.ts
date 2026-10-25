import { runDrizzleCommand } from "./drizzle-command.js";

try {
  await runDrizzleCommand("generate", process.argv.slice(2));
} catch {
  console.error(
    "Migration generation failed. Review the schema and Drizzle diagnostics.",
  );
  process.exitCode = 1;
}
