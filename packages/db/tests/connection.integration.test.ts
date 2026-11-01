import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { once } from "node:events";
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, expect, it } from "vitest";
import {
  createDatabase,
  readDatabaseConfig,
  requireTestDatabase,
} from "../dist/index.js";

// The app role from DATABASE_URL. Global setup already refused any database
// not named *_test; repeat the guard for direct imports of this file.
const config = readDatabaseConfig(process.env);
requireTestDatabase(config);
const database = createDatabase(config);
const execute = promisify(execFile);

beforeAll(async () => {
  await database.check();
});
afterAll(async () => {
  await database.close();
});

it("queries through the real Drizzle adapter and rolls back a failed transaction", async () => {
  const result = await database.db.execute<{ value: number }>(
    sql`SELECT 1::integer AS value`,
  );
  expect(result.rows[0]?.value).toBe(1);
  // A session setting would persist on commit, so its absence proves rollback.
  await expect(
    database.db.transaction(async (transaction) => {
      await transaction.execute(
        sql`SELECT set_config('storage_minis.probe', 'inside', false)`,
      );
      throw new Error("intentional transaction failure");
    }),
  ).rejects.toThrow("intentional transaction failure");
  const after = await database.db.execute<{ value: string | null }>(
    sql`SELECT current_setting('storage_minis.probe', true) AS value`,
  );
  expect(after.rows[0]?.value ?? "").toBe("");
});

it("bounds server query time and recovers after failure", async () => {
  const start = performance.now();
  await expect(database.db.execute(sql`SELECT pg_sleep(10)`)).rejects.toThrow();
  expect(performance.now() - start).toBeLessThan(6_000);
  await database.check();
});

it("fails safely for wrong credentials and closes idempotently", async () => {
  const invalid = createDatabase({
    ...config,
    password: "deliberately-invalid-fixture-password",
  });
  const start = performance.now();
  try {
    await expect(invalid.check()).rejects.toThrow("Database check failed");
    expect(performance.now() - start).toBeLessThan(6_000);
  } finally {
    const closing = invalid.close();
    expect(invalid.close()).toBe(closing);
    await closing;
  }
  await expect(invalid.check()).rejects.toThrow("Database is closing");
});

it("handles idle socket failure and establishes readiness again", async () => {
  const subject = createDatabase(config);
  const controller = createDatabase(config);
  try {
    expect(subject.healthy).toBe(false);
    await subject.check();
    const result = await subject.db.execute<{ pid: number }>(
      sql`SELECT pg_backend_pid() AS pid`,
    );
    const pid = result.rows[0]?.pid;
    expect(pid).toBeTypeOf("number");
    const idleFailure = once(subject.db.$client, "error");
    await controller.db.execute(sql`SELECT pg_terminate_backend(${pid})`);
    await idleFailure;
    expect(subject.healthy).toBe(false);
    await subject.check();
    expect(subject.healthy).toBe(true);
  } finally {
    await Promise.all([subject.close(), controller.close()]);
  }
});

it("drains active work before closing and refuses later checks", async () => {
  const subject = createDatabase(config);
  const started = once(subject.db.$client, "acquire");
  const pending = Promise.resolve(
    subject.db.execute(sql`SELECT pg_sleep(0.1)`),
  );
  await started;
  const closing = subject.close();
  await pending;
  await closing;
  expect(subject.healthy).toBe(false);
  await expect(subject.check()).rejects.toThrow("Database is closing");
});

it("imports without configuration and exits without opening a connection", async () => {
  const result = await execute(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      "await import('@storage-minis/db'); console.log('imported');",
    ],
    {
      cwd: new URL("..", import.meta.url),
      env: { PATH: process.env.PATH },
      timeout: 5_000,
    },
  );
  expect(result.stdout.trim()).toBe("imported");
});

it("bounds shutdown and ends the socket when a caller leaks a checked-out client", async () => {
  const subject = createDatabase(config);
  const client = await subject.db.$client.connect();
  const start = performance.now();
  try {
    await expect(subject.close()).rejects.toThrow(
      "Database shutdown timed out",
    );
    expect(performance.now() - start).toBeLessThan(11_000);
    await expect(client.query("SELECT 1")).rejects.toThrow();
  } finally {
    client.release(true);
  }
});

it("a plain Node consumer checks and closes without leaked handles", async () => {
  const result = await execute(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      "import { createDatabase, readDatabaseConfig } from '@storage-minis/db'; const db = createDatabase(readDatabaseConfig(process.env)); try { await db.check(); console.log('checked'); } finally { await db.close(); }",
    ],
    {
      cwd: new URL("..", import.meta.url),
      timeout: 10_000,
    },
  );
  expect(result.stdout.trim()).toBe("checked");
});

it("connects only to the URL's components despite ambient libpq settings", async () => {
  const result = await execute(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      "import { createDatabase, readDatabaseConfig } from '@storage-minis/db'; const db = createDatabase(readDatabaseConfig(process.env)); try { await db.check(); console.log('checked'); } finally { await db.close(); }",
    ],
    {
      cwd: new URL("..", import.meta.url),
      env: {
        PATH: process.env.PATH,
        DATABASE_URL: process.env.DATABASE_URL,
        PGHOST: "ambient-host.invalid",
        PGPORT: "1",
        PGUSER: "ambient_user",
        PGPASSWORD: "ambient-password",
        PGDATABASE: "ambient_database",
        PGSSLMODE: "verify-full",
      },
      timeout: 10_000,
    },
  );
  expect(result.stdout.trim()).toBe("checked");
});
