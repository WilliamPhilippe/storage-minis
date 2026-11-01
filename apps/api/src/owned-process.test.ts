import { spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { expect, it } from "vitest";
import { ownProcess } from "../tests/owned-process.js";

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

function importConfig(DATABASE_URL: string) {
  return spawnSync(
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
        try { await import('./vitest.process.config.mts'); console.log('config loaded'); }
        catch (error) { console.error('guard refused:', error.message); process.exitCode = 1; }
      `,
    ],
    {
      cwd: new URL("..", import.meta.url),
      env: { DATABASE_URL },
      encoding: "utf8",
      timeout: 5_000,
    },
  );
}

it("process config refuses non-test and invalid URLs before child or socket acquisition", () => {
  const accepted = importConfig(
    "postgres://storage_minis_app:guard-secret@127.0.0.1:5434/storage_minis_test",
  );
  expect(accepted.status).toBe(0);
  expect(accepted.stdout).toContain("config loaded");
  for (const [DATABASE_URL, message] of [
    [
      "postgres://storage_minis_app:guard-secret@127.0.0.1:5433/storage_minis_dev",
      "require a database whose name ends in _test",
    ],
    [
      "postgres://storage_minis_app:guard-secret@postgres:5432/storage_minis",
      "require a database whose name ends in _test",
    ],
    ["postgres://guard-secret@host/database", "Invalid DATABASE_URL."],
  ] as const) {
    const result = importConfig(DATABASE_URL);
    const output = result.stdout + result.stderr;
    expect(result.status).toBe(1);
    expect(output).toContain("guard refused:");
    expect(output).toContain(message);
    expect(output).not.toContain("UNEXPECTED_ACQUISITION");
    expect(output).not.toContain("guard-secret");
  }
}, 15_000);
