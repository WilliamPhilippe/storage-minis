import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { migrationLimits } from "../src/migrations.js";

// Keep Drizzle's native generation/application and transaction semantics. This
// supervisor only bounds process lifetime, forwards signals and sanitizes live
// errors, which can otherwise include connection details or raw SQL parameters.
export async function runDrizzleCommand(
  operation: "generate" | "migrate",
  arguments_: readonly string[] = [],
): Promise<void> {
  const require = createRequire(import.meta.url);
  const child = spawn(
    process.execPath,
    [
      join(dirname(require.resolve("drizzle-kit")), "bin.cjs"),
      operation,
      "--config",
      operation === "generate"
        ? "drizzle.config.ts"
        : "drizzle.migrate.config.ts",
      ...arguments_,
    ],
    {
      cwd: fileURLToPath(new URL("..", import.meta.url)),
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        // pg reads these options on its actual connections, including those
        // created inside drizzle-kit. Replace any ambient PGOPTIONS.
        PGOPTIONS: `-c lock_timeout=${migrationLimits.lockMs} -c statement_timeout=${migrationLimits.statementMs} -c idle_in_transaction_session_timeout=${migrationLimits.statementMs} -c timezone=UTC`,
        PGCONNECT_TIMEOUT: "2",
      },
    },
  );
  let interrupted = false;
  let generationOutput = "";
  let killTimer: ReturnType<typeof setTimeout> | undefined;
  function interrupt(signal: NodeJS.Signals) {
    if (interrupted) return;
    interrupted = true;
    child.kill(signal);
    killTimer = setTimeout(() => child.kill("SIGKILL"), 5_000);
  }
  const onInterrupt = () => interrupt("SIGINT");
  const onTerminate = () => interrupt("SIGTERM");
  const deadline = setTimeout(onTerminate, migrationLimits.processMs);
  process.once("SIGINT", onInterrupt);
  process.once("SIGTERM", onTerminate);
  if (operation === "generate") {
    child.stdout.on("data", (chunk: Buffer) => {
      generationOutput += chunk.toString();
    });
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  } else {
    child.stdout.resume();
    child.stderr.resume();
  }
  try {
    const code = await new Promise<number | null>((resolve, reject) => {
      child.once("error", reject);
      child.once("close", resolve);
    });
    if (interrupted || code !== 0) throw new Error("Drizzle command failed.");
    // Kit 0.31.11 catches some generation exceptions and exits zero. Require
    // its terminal success message as well as the process status.
    if (
      operation === "generate" &&
      !generationOutput.includes("No schema changes, nothing to migrate") &&
      !generationOutput.includes("Your SQL migration file")
    ) {
      throw new Error("Drizzle generation did not complete.");
    }
    if (operation === "migrate")
      console.log(
        "Database migrations applied; already-applied migrations were skipped.",
      );
  } finally {
    clearTimeout(deadline);
    clearTimeout(killTimer);
    process.removeListener("SIGINT", onInterrupt);
    process.removeListener("SIGTERM", onTerminate);
  }
}
