import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { readDatabaseConfig, requireTestDatabase } from "@storage-minis/db";
import { ownProcess } from "./owned-process.js";

async function main() {
  // Guard before spawning Vitest, creating a client, or attempting cleanup.
  const config = readDatabaseConfig(process.env);
  requireTestDatabase(config);
  const require = createRequire(import.meta.url);
  const suite = ownProcess(
    [
      join(dirname(require.resolve("vitest/package.json")), "vitest.mjs"),
      "run",
      "--config",
      "vitest.process.config.mts",
    ],
    {
      cwd: new URL("..", import.meta.url),
      env: process.env,
      group: true,
      deadlineMs: 180_000,
      killAfterMs: 10_000,
      maxBytes: 524_288,
    },
  );
  let interrupted = false;
  const interrupt = (signal: "SIGINT" | "SIGTERM") => {
    interrupted = true;
    suite.stop(signal);
  };
  const onInt = () => interrupt("SIGINT");
  const onTerm = () => interrupt("SIGTERM");
  process.on("SIGINT", onInt);
  process.on("SIGTERM", onTerm);
  try {
    const result = await suite.result;
    // Vitest failures can include assertion context. Never forward credentials.
    process.stdout.write(
      suite.output
        .replaceAll(config.password, "[redacted]")
        .replace(/postgres(?:ql)?:\/\/[^\s"']+/giu, "[redacted database URL]"),
    );
    if (result.failure) console.error("API process suite ownership failed.");
    process.exitCode =
      interrupted || result.failure || result.signal ? 1 : (result.code ?? 1);
  } finally {
    process.removeListener("SIGINT", onInt);
    process.removeListener("SIGTERM", onTerm);
  }
}

main().catch(() => {
  console.error(
    "API process tests require the exact explicit test configuration.",
  );
  process.exitCode = 1;
});
