import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readDatabaseConfig, requireTestDatabase } from "../src/config.js";

requireTestDatabase(readDatabaseConfig(process.env));
const require = createRequire(import.meta.url);
const child = spawn(
  process.execPath,
  [
    join(dirname(require.resolve("vitest/package.json")), "vitest.mjs"),
    "run",
    "--config",
    "vitest.integration.config.mts",
  ],
  {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    stdio: "inherit",
    detached: true,
  },
);
let interrupted = false;
let killTimer: ReturnType<typeof setTimeout> | undefined;
function interrupt(signal: NodeJS.Signals) {
  if (interrupted || !child.pid) return;
  interrupted = true;
  try {
    process.kill(-child.pid, signal);
  } catch {
    // The child may have exited between signal delivery and this handler.
  }
  killTimer = setTimeout(() => {
    if (child.pid) {
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch {
        /* Already exited. */
      }
    }
  }, 10_000);
}
const deadline = setTimeout(() => {
  interrupt("SIGTERM");
}, 120_000);
process.once("SIGINT", () => {
  interrupt("SIGINT");
});
process.once("SIGTERM", () => {
  interrupt("SIGTERM");
});
child.once("error", () => {
  clearTimeout(deadline);
  clearTimeout(killTimer);
  console.error("Could not start database integration tests.");
  process.exitCode = 1;
});
child.once("exit", (code) => {
  clearTimeout(deadline);
  clearTimeout(killTimer);
  process.exitCode = interrupted ? 1 : (code ?? 1);
});
