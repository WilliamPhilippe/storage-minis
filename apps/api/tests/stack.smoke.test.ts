import { execFile, spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterAll, beforeAll, expect, it } from "vitest";

// Runs the production Compose model as the isolated storage-minis-stack
// project through the same root scripts developers use (R2/R10/R15).
const run = promisify(execFile);
const root = fileURLToPath(new URL("../../..", import.meta.url));
const compose = [
  "compose",
  "--project-name",
  "storage-minis-stack",
  "--file",
  "compose.yaml",
  "--file",
  "compose.stack.yaml",
  "--env-file",
  ".env.test",
];
const api = "http://127.0.0.1:3100";
const maxBuffer = 16 * 1024 * 1024;

interface Container {
  Id: string;
  Image: string;
  Config: { User: string };
  Mounts: unknown[];
  State: {
    Running: boolean;
    ExitCode: number;
    OOMKilled: boolean;
    StartedAt: string;
    FinishedAt: string;
  };
  NetworkSettings: {
    Ports: Record<string, { HostIp: string; HostPort: string }[] | null>;
  };
}

function pnpm(script: string, timeout: number, env = process.env) {
  return run("pnpm", ["--silent", script], {
    cwd: root,
    env,
    timeout,
    maxBuffer,
  });
}

async function docker(args: string[], timeout = 30_000) {
  const { stdout } = await run("docker", args, {
    cwd: root,
    timeout,
    maxBuffer,
  });
  return stdout.trim();
}

async function inspect(service: string): Promise<Container> {
  const id = await docker([...compose, "ps", "--all", "--quiet", service]);
  expect(id).toMatch(/^[0-9a-f]{12,64}$/);
  const [container] = JSON.parse(await docker(["inspect", id])) as Container[];
  if (!container) throw new Error(`No container for ${service}.`);
  return container;
}

async function health(path: string) {
  const response = await fetch(`${api}${path}`, {
    signal: AbortSignal.timeout(8_000),
    headers: { Connection: "close" },
  });
  return { status: response.status, body: await response.text() };
}

beforeAll(async () => {
  // Start from a clean project, including its throwaway database volume.
  await pnpm("stack:down", 120_000);
  await pnpm("stack:up", 900_000);
});

afterAll(async () => {
  await pnpm("stack:down", 120_000);
});

it("migrates before the API starts and runs the image as nonroot without mounts", async () => {
  const [migrate, server, postgres] = await Promise.all([
    inspect("migrate"),
    inspect("api"),
    inspect("postgres"),
  ]);
  expect(migrate.State).toMatchObject({ Running: false, ExitCode: 0 });
  expect(Date.parse(migrate.State.FinishedAt)).toBeLessThanOrEqual(
    Date.parse(server.State.StartedAt),
  );
  expect(server.Image).toBe(migrate.Image);
  expect(server.Config.User).toBe("node");
  expect(server.Mounts).toEqual([]);
  expect(server.NetworkSettings.Ports["3000/tcp"]).toEqual([
    { HostIp: "127.0.0.1", HostPort: "3100" },
  ]);
  // Only migrate and api reach the stack's database (R15).
  expect(postgres.NetworkSettings.Ports["5432/tcp"]).toBeNull();
});

it("answers the exact health responses on 127.0.0.1:3100", async () => {
  expect(await health("/health/live")).toEqual({
    status: 200,
    body: '{"status":"ok"}',
  });
  expect(await health("/health/ready")).toEqual({
    status: 200,
    body: '{"status":"ready"}',
  });
});

function psql(sql: string) {
  return docker([
    ...compose,
    "exec",
    "-T",
    "postgres",
    "psql",
    "-X",
    "-At",
    "-U",
    "storage_minis_owner",
    "-d",
    "storage_minis_test",
    "-c",
    sql,
  ]);
}

const historyLock =
  "FROM pg_locks l JOIN pg_class c ON c.oid = l.relation WHERE c.relname = '__drizzle_migrations' AND l.mode = 'AccessExclusiveLock' AND l.granted";

it("keeps the running API serving when a redeploy's migrate fails (R19)", async () => {
  const before = await inspect("api");
  expect(before.State.Running).toBe(true);
  // Another session holds the migration-history lock, so the redeploy's
  // one-off migrate fails at its 5 s lock timeout without any service change.
  const holder = spawn(
    "docker",
    [
      ...compose,
      "exec",
      "-T",
      "postgres",
      "psql",
      "-X",
      "-U",
      "storage_minis_owner",
      "-d",
      "storage_minis_test",
      "-c",
      "BEGIN; LOCK TABLE drizzle.__drizzle_migrations IN ACCESS EXCLUSIVE MODE; SELECT pg_sleep(60); COMMIT;",
    ],
    { cwd: root, stdio: "ignore" },
  );
  const held = new Promise<void>((resolve) =>
    holder.once("exit", () => resolve()),
  );
  try {
    for (
      let attempt = 0;
      (await psql(`SELECT count(*) ${historyLock}`)) !== "1";
      attempt++
    ) {
      if (attempt > 100)
        throw new Error("The lock holder never acquired the lock.");
      await delay(100);
    }
    // Like a real deploy, the redeploy changes the API's configuration (here
    // LOG_LEVEL, which neither postgres nor migrate uses), so a single `up`
    // would recreate, and so stop, the API before migrate fails.
    const failure: unknown = await pnpm("stack:up", 180_000, {
      ...process.env,
      LOG_LEVEL: "warn",
    }).then(
      () => null,
      (error: unknown) => error,
    );
    expect(failure).toMatchObject({ code: 1 });
    // The same container, never restarted, still answers.
    const after = await inspect("api");
    expect(after.Id).toBe(before.Id);
    expect(after.State.StartedAt).toBe(before.State.StartedAt);
    expect(after.State.Running).toBe(true);
    expect(await health("/health/ready")).toEqual({
      status: 200,
      body: '{"status":"ready"}',
    });
    expect(String(failure)).toContain(
      "canceling statement due to lock timeout",
    );
    console.info(
      `Failed redeploy kept API container ${after.Id.slice(0, 12)} serving.`,
    );
  } finally {
    await psql(`SELECT pg_terminate_backend(l.pid) ${historyLock}`);
    await held;
  }
}, 180_000);

it("stops the API with SIGTERM and exit code 143 within its shutdown bound", async () => {
  const started = performance.now();
  await docker([...compose, "stop", "api"]);
  const elapsed = performance.now() - started;
  expect((await inspect("api")).State).toMatchObject({
    Running: false,
    ExitCode: 143,
    OOMKilled: false,
  });
  // The application's shutdown bound is 10 s; Compose force-kills at 15 s.
  expect(elapsed).toBeLessThan(10_000);
  console.info(`API stop: exit 143 in ${Math.round(elapsed)}ms.`);
});

it("does not start a stopped API when migrate fails", async () => {
  // The previous test stopped the API. The database was initialized with the
  // committed owner password, so another value makes migrate fail, and the
  // API must not start (D6). The R19 test above covers a running API.
  const failure: unknown = await pnpm("stack:up", 180_000, {
    ...process.env,
    DB_OWNER_PASSWORD: "deliberately-wrong-owner-password",
  }).then(
    () => null,
    (error: unknown) => error,
  );
  expect(failure).toMatchObject({ code: 1 });
  expect(String(failure)).toContain("Database migration failed.");
  expect(String(failure)).toContain("password authentication failed");
  expect(String(failure)).not.toContain("deliberately-wrong-owner-password");
  console.info(
    `Failed migrate: ${String(failure)
      .split("\n")
      .filter((line) => /migration failed|Caused by/.test(line))
      .join(" | ")}`,
  );
  expect((await inspect("api")).State.Running).toBe(false);
  await expect(health("/health/live")).rejects.toThrow();
}, 180_000);
