import { createDatabase, readDatabaseConfig } from "../dist/index.js";
import type { Database } from "../dist/index.js";
import { formatDatabaseError } from "../src/diagnostics.js";

export async function runDatabaseCommand(
  action: (database: Database) => Promise<void>,
): Promise<void> {
  let database: Database | undefined;
  let closing: Promise<void> | undefined;
  let signalDeadline: ReturnType<typeof setTimeout> | undefined;
  // Six seconds for a check plus ten for cleanup, with a process-level fallback.
  const deadline = setTimeout(() => {
    console.error("Database command exceeded its cleanup deadline.");
    process.exit(1);
  }, 17_000);
  deadline.unref();

  function close(): Promise<void> {
    closing ??= (async () => {
      try {
        await database?.close();
      } catch (error) {
        console.error(
          "Database command cleanup failed.",
          formatDatabaseError(error),
        );
        process.exitCode ??= 1;
      }
    })();
    return closing;
  }
  function interrupt(code: number) {
    if (signalDeadline) return;
    process.exitCode = code;
    signalDeadline = setTimeout(() => {
      process.exit(code);
    }, 10_000);
    signalDeadline.unref();
    void close();
  }
  const onInterrupt = () => {
    interrupt(130);
  };
  const onTerminate = () => {
    interrupt(143);
  };
  process.once("SIGINT", onInterrupt);
  process.once("SIGTERM", onTerminate);
  try {
    database = createDatabase(readDatabaseConfig(process.env));
    await action(database);
  } catch (error) {
    console.error(
      "Database command failed. Verify configuration, credentials and availability.",
      formatDatabaseError(error),
    );
    process.exitCode ??= 1;
  } finally {
    await close();
    process.removeListener("SIGINT", onInterrupt);
    process.removeListener("SIGTERM", onTerminate);
    // Keep the unref'ed watchdogs armed if leaked resources prevent process exit.
  }
}
