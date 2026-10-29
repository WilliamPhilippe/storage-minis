import { spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { expect, it } from "vitest";
import { ownProcess } from "../scripts/owned-process.js";

async function requireGone(pid: number | undefined) {
  expect(pid).toBeTypeOf("number");
  const end = performance.now() + 1_000;
  while (true) {
    try {
      process.kill(pid ?? 0, 0);
    } catch {
      return;
    }
    if (performance.now() >= end)
      throw new Error("Owned child survived cleanup.");
    await delay(10);
  }
}

it("owns normal child exit and captures bounded output", async () => {
  const child = ownProcess(["-e", "console.log('owned')"], {
    deadlineMs: 2_000,
  });
  expect(await child.result).toEqual({
    code: 0,
    signal: null,
    failure: undefined,
  });
  expect(child.output).toBe("owned\n");
  await requireGone(child.child.pid);
});

it("forces a child that ignores termination after its deadline", async () => {
  const child = ownProcess(
    [
      "-e",
      "process.on('SIGTERM', () => {}); console.log('owned'); setInterval(() => {}, 1000)",
    ],
    { deadlineMs: 1_000, killAfterMs: 100, group: true },
  );
  await child.waitForOutput("owned");
  const result = await child.result;
  expect(result.failure).toBe("process deadline");
  expect(result.signal).toBe("SIGKILL");
  expect(child.settled).toBe(true);
  await requireGone(child.child.pid);
});

it("fails output overflow and releases the writer", async () => {
  const child = ownProcess(
    [
      "-e",
      "process.stdout.write('x'.repeat(10000)); setInterval(() => {}, 1000)",
    ],
    { deadlineMs: 2_000, killAfterMs: 100, maxBytes: 100 },
  );
  expect((await child.result).failure).toBe("process output limit");
  expect(Buffer.byteLength(child.output)).toBe(100);
  await requireGone(child.child.pid);
});

it("detects and terminates descendants even after the suite leader exits", async () => {
  const child = ownProcess(
    [
      "-e",
      "const {spawn}=require('node:child_process'); const c=spawn(process.execPath,['-e','setInterval(() => {}, 1000)'],{stdio:'inherit'}); console.log(c.pid); c.unref();",
    ],
    { deadlineMs: 2_000, killAfterMs: 100, group: true },
  );
  expect((await child.result).failure).toBe("surviving process group");
  expect(child.settled).toBe(true);
  await requireGone(child.child.pid);
  await requireGone(Number(child.output.trim()));
});

it("shares termination ownership for repeated outer signals", async () => {
  const child = ownProcess(
    ["-e", "console.log('owned'); setInterval(() => {}, 1000)"],
    { deadlineMs: 2_000, group: true, killAfterMs: 100 },
  );
  await child.waitForOutput("owned");
  child.stop("SIGINT");
  child.stop("SIGTERM");
  expect(await child.result).toEqual({
    code: null,
    signal: "SIGINT",
    failure: undefined,
  });
});

it("runner and config refuse dev/mixed/URL targets before child or socket acquisition", () => {
  const base = {
    DB_TARGET: "test",
    PGHOST: "postgres_test",
    PGPORT: "5432",
    PGDATABASE: "storage_minis_test",
    PGUSER: "postgres",
    PGPASSWORD: "guard-secret",
  };
  for (const entry of [
    "scripts/process-tests.ts",
    "vitest.process.config.mts",
  ]) {
    for (const override of [
      { DB_TARGET: "dev", PGHOST: "postgres", PGDATABASE: "storage_minis_dev" },
      { PGHOST: "postgres" },
      { PGDATABASE: "storage_minis_dev" },
      { PGPORT: "5434" },
      { DATABASE_URL: "postgres://guard-secret@host/database" },
    ]) {
      const result = spawnSync(
        process.execPath,
        [
          "--import",
          "tsx",
          "--input-type=module",
          "-e",
          `
        import cp from 'node:child_process';
        import { Socket } from 'node:net';
        import { syncBuiltinESMExports } from 'node:module';
        cp.spawn = () => { console.error('UNEXPECTED_ACQUISITION'); throw new Error('unexpected child'); };
        Socket.prototype.connect = () => { console.error('UNEXPECTED_ACQUISITION'); throw new Error('unexpected socket'); };
        syncBuiltinESMExports();
        await import('@storage-minis/db');
        try { await import('./${entry}'); }
        catch { console.error('guard refused'); process.exitCode = 1; }
      `,
        ],
        {
          cwd: new URL("..", import.meta.url),
          env: { ...base, ...override },
          encoding: "utf8",
          timeout: 5_000,
        },
      );
      expect(result.status).toBe(1);
      expect(result.stdout + result.stderr).toContain(
        entry.startsWith("scripts/")
          ? "API process tests require the exact explicit test configuration."
          : "guard refused",
      );
      expect(result.stdout + result.stderr).not.toContain(
        "UNEXPECTED_ACQUISITION",
      );
      expect(result.stdout + result.stderr).not.toContain("guard-secret");
    }
  }
}, 15_000);
