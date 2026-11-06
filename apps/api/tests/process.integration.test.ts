import assert from "node:assert/strict";
import { createConnection, createServer } from "node:net";
import type { Server, Socket } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import {
  createDatabase,
  readDatabaseConfig,
  requireTestDatabase,
} from "@storage-minis/db";
import type { Database } from "@storage-minis/db";
import { afterAll, afterEach, beforeAll, it } from "vitest";
import { ownProcess } from "./owned-process.js";
import type { OwnedProcess } from "./owned-process.js";

// Guard even direct imports before acquiring any controller or cleanup owner.
const config = readDatabaseConfig(process.env);
requireTestDatabase(config);
const cwd = new URL("..", import.meta.url);

/**
 * The validated test DATABASE_URL, optionally redirected to an owned loopback
 * port. Only the host and port change; credentials and sslmode are kept.
 */
function databaseUrl(port = config.port, host = config.host) {
  const url = new URL(process.env.DATABASE_URL ?? "");
  url.hostname = host.includes(":") ? `[${host}]` : host;
  url.port = String(port);
  return url.href;
}
const children = new Set<OwnedProcess>();
const listeners = new Set<Server>();
const sockets = new Set<Socket>();
const usedPorts = new Set<number>();
let controller: Database;
let schemaBefore: string[];

async function otherBackends() {
  const result = await controller.db.$client.query<{ pid: number }>(
    "SELECT pid FROM pg_stat_activity WHERE datname = $1 AND application_name = 'storage-minis' AND pid <> pg_backend_pid()",
    [config.database],
  );
  return result.rows;
}

async function schemaNames() {
  const result = await controller.db.$client.query<{ name: string }>(
    "SELECT table_schema || '.' || table_name AS name FROM information_schema.tables WHERE table_schema IN ('public', 'drizzle') ORDER BY 1",
  );
  return result.rows.map((row) => row.name);
}

beforeAll(async () => {
  controller = createDatabase(config);
  await controller.check();
  assert.equal(
    (await otherBackends()).length,
    0,
    "Shared test target is still in use; do not overlap phases.",
  );
  schemaBefore = await schemaNames();
});

async function closeListener(server: Server) {
  if (server.listening)
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  listeners.delete(server);
}

afterEach(async () => {
  // All owners exist before assertions; failed tests use the same cleanup path.
  for (const socket of sockets) socket.destroy();
  sockets.clear();
  for (const child of children) child.stop();
  const results = await Promise.all([...children].map((child) => child.result));
  for (const server of [...listeners]) await closeListener(server);
  children.clear();
  assert.equal(
    results.some((result) => result.failure !== undefined),
    false,
    "Harness watchdog/forced cleanup is a failure, never passing API evidence.",
  );
  await assertNoPoolLeaks();
});

afterAll(async () => {
  try {
    assert.deepEqual(
      await schemaNames(),
      schemaBefore,
      "Process tests changed schema identity.",
    );
    await assertNoPoolLeaks();
  } finally {
    await controller.close();
  }
  assert.equal(controller.db.$client.totalCount, 0, "Controller pool leaked.");
});

async function assertNoPoolLeaks() {
  const end = performance.now() + 1_000;
  while ((await otherBackends()).length !== 0) {
    assert.ok(
      performance.now() < end,
      "API pool backend survived process cleanup.",
    );
    await delay(20);
  }
}

async function listen(port = 0, onConnection?: (socket: Socket) => void) {
  const server = createServer((socket) => {
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
    onConnection?.(socket);
  });
  listeners.add(server);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen({ host: "127.0.0.1", port, exclusive: true }, resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  return { server, port: address.port };
}

async function reservePort() {
  for (let attempt = 0; attempt < 100; attempt++) {
    const reservation = await listen();
    if (!usedPorts.has(reservation.port)) {
      usedPorts.add(reservation.port);
      return reservation;
    }
    await closeListener(reservation.server);
  }
  throw new Error("Could not reserve a distinct child port.");
}

async function startChild(
  overrides: NodeJS.ProcessEnv = {},
  occupied?: Awaited<ReturnType<typeof reservePort>>,
  fixture?: string,
) {
  const reservation = occupied ?? (await reservePort());
  // The actual entry requires 1..65535. Transfer a reserved port, then require
  // THIS child's success marker before probing; a competing bind fails closed.
  if (!occupied) await closeListener(reservation.server);
  const child = ownProcess(
    [
      "--enable-source-maps",
      ...(fixture
        ? ["tests/fixtures/shutdown.ts", fixture]
        : ["dist/server.js"]),
    ],
    {
      cwd,
      env: {
        DATABASE_URL: databaseUrl(),
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        HOST: "127.0.0.1",
        PORT: String(reservation.port),
        LOG_LEVEL: "silent",
        NODE_ENV: "test",
        TZ: "UTC",
        ...overrides,
      },
      deadlineMs: fixture ? 25_000 : 20_000,
      killAfterMs: 1_000,
    },
  );
  children.add(child);
  return { child, port: reservation.port };
}

const listening = '"msg":"listening"';

interface LoggedError {
  type: string;
  code?: string;
  message?: string;
  stack?: string;
  cause?: LoggedError;
}
interface LifecycleLine {
  level: number;
  time: number;
  msg: string;
  err?: LoggedError;
}

/** The API's JSON lifecycle lines; fixture markers are plain text. */
function lifecycleLines(child: OwnedProcess): LifecycleLine[] {
  return child.output
    .split("\n")
    .filter((line) => line.startsWith("{"))
    .map((line) => JSON.parse(line) as LifecycleLine);
}

function lifecycle(child: OwnedProcess, category: string) {
  return lifecycleLines(child).filter((line) => line.msg === category);
}

/** A startup failure prints exactly one error line and nothing else. */
function onlyFailure(child: OwnedProcess, category: string): LoggedError {
  assert.equal(child.output.trimEnd().split("\n").length, 1);
  const [line] = lifecycleLines(child);
  assert.ok(line, "Expected one JSON lifecycle line.");
  assert.deepEqual(Object.keys(line).sort(), ["err", "level", "msg", "time"]);
  assert.equal(line.level, 50);
  assert.equal(line.msg, category);
  assert.ok(line.err);
  return line.err;
}

/** The cause chain, asserting every entry holds only allowlisted fields. */
function chain(error: LoggedError | undefined): LoggedError[] {
  const errors: LoggedError[] = [];
  for (let current = error; current; current = current.cause)
    errors.push(current);
  for (const entry of errors)
    for (const key of Object.keys(entry))
      assert.ok(
        ["type", "code", "message", "stack", "cause"].includes(key),
        `Unexpected error field ${key}.`,
      );
  return errors;
}

function safeOutput(child: OwnedProcess) {
  for (const secret of [
    config.password,
    process.env.DATABASE_URL ?? "",
    "invalid-credential-sentinel",
    "config-secret-sentinel",
  ])
    assert.equal(
      child.output.includes(secret),
      false,
      "API exposed supplied secret data.",
    );
  // Only the fixed expected-shape text of a ConfigurationError may name a URL.
  assert.doesNotMatch(
    child.output,
    /postgres(ql)?:\/\/(?!USER:PASSWORD@HOST:PORT\/DATABASE)/,
    "API exposed a database URL.",
  );
  assert.equal(
    child.output.includes("Error:"),
    false,
    "API exposed a raw exception.",
  );
}

async function releasedPort(port: number) {
  const probe = await listen(port);
  await closeListener(probe.server);
}

async function exited(child: OwnedProcess, code: number) {
  const result = await child.result;
  assert.equal(result.failure, undefined, "API exceeded the harness bound.");
  assert.equal(result.signal, null, "API required OS termination.");
  assert.equal(result.code, code);
  safeOutput(child);
  if (child.child.pid)
    assert.throws(() => process.kill(child.child.pid ?? 0, 0), {
      code: "ESRCH",
    });
}

async function health(port: number, path: string, body: string, status = 200) {
  const start = performance.now();
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    signal: AbortSignal.timeout(8_000),
    headers: { Connection: "close" },
  });
  assert.equal(response.status, status);
  assert.equal(await response.text(), body);
  const elapsed = performance.now() - start;
  assert.ok(elapsed < 7_000, "Health exceeded 6s plus 1s scheduling margin.");
  return elapsed;
}

function onceClosed(child: OwnedProcess, marker: string) {
  assert.equal(child.output.split(`Shutdown fixture: ${marker}.`).length, 2);
}

it("cancels pending startup, owns the late completion and never listens", async () => {
  const { child, port } = await startChild({}, undefined, "startup-finite");
  await child.waitForOutput("Shutdown fixture: startup_pending.");
  const start = performance.now();
  child.child.kill("SIGTERM");
  await delay(50);
  child.child.kill("SIGINT");
  await exited(child, 143);
  assert.ok(performance.now() - start < 10_000);
  onceClosed(child, "startup_settled");
  onceClosed(child, "database_close");
  onceClosed(child, "database_closed");
  assert.equal(child.output.includes(listening), false);
  await releasedPort(port);
});

it.each(["SIGINT", "SIGTERM"] as const)(
  "drains an in-flight request with repeated %s and shares one pool close",
  async (signal) => {
    const { child, port } = await startChild({}, undefined, "drain");
    await child.waitForOutput(listening);
    const response = fetch(`http://127.0.0.1:${port}/fixture/drain`, {
      signal: AbortSignal.timeout(8_000),
      headers: { Connection: "close" },
    });
    // Attach rejection ownership before any assertion can fail.
    const result = response.then(async (value) => ({
      status: value.status,
      body: await value.text(),
    }));
    void result.catch(() => {});
    await child.waitForOutput("Shutdown fixture: request_started.");
    const start = performance.now();
    child.child.kill(signal);
    await delay(50);
    child.child.kill(signal === "SIGINT" ? "SIGTERM" : "SIGINT");
    await delay(50);
    child.child.kill(signal);
    assert.deepEqual(await result, { status: 200, body: '{"drained":true}' });
    await exited(child, signal === "SIGINT" ? 130 : 143);
    const elapsed = performance.now() - start;
    assert.ok(elapsed >= 5_000 && elapsed < 10_000);
    onceClosed(child, "http_close");
    onceClosed(child, "database_close");
    onceClosed(child, "database_closed");
    console.info(`Repeated ${signal}: drained in ${Math.round(elapsed)}ms.`);
    await releasedPort(port);
  },
);

it.each(["fail-http", "fail-database"])(
  "forces failure after attempting both owners for %s",
  async (mode) => {
    const { child, port } = await startChild({}, undefined, mode);
    await child.waitForOutput(listening);
    const start = performance.now();
    child.child.kill("SIGTERM");
    await exited(child, 1);
    assert.ok(performance.now() - start < 10_000);
    onceClosed(child, "http_close");
    onceClosed(child, "database_close");
    const [closeFailure] = lifecycle(
      child,
      `${mode === "fail-http" ? "http" : "database"}_close_failed`,
    );
    assert.equal(closeFailure?.level, 50);
    assert.equal(closeFailure.err?.type, "Error");
    assert.equal(closeFailure.err.message, undefined);
    assert.match(closeFailure.err.stack ?? "", /^at /);
    if (mode === "fail-http") onceClosed(child, "database_closed");
    await releasedPort(port);
  },
);

it.each(["hang-http", "hang-database", "startup-hang"])(
  "enforces one real 10s shutdown watchdog for %s",
  async (mode) => {
    const { child, port } = await startChild({}, undefined, mode);
    await child.waitForOutput(
      mode === "startup-hang"
        ? "Shutdown fixture: startup_pending."
        : listening,
    );
    // Spending 6s draining HTTP before the hung DB close proves that DB does
    // not receive a fresh 10s budget after HTTP has consumed part of it.
    let request: Promise<void> | undefined;
    if (mode === "hang-database") {
      request = health(port, "/fixture/drain", '{"drained":true}').then(
        () => {},
      );
      void request.catch(() => {});
      await child.waitForOutput("Shutdown fixture: request_started.");
    }
    const start = performance.now();
    child.child.kill("SIGTERM");
    await exited(child, 1);
    await request;
    const elapsed = performance.now() - start;
    assert.ok(elapsed >= 9_900 && elapsed < 11_000);
    assert.equal(lifecycle(child, "shutdown_timeout").length, 1);
    if (mode === "hang-database") onceClosed(child, "database_close");
    else
      assert.equal(
        child.output.includes("Shutdown fixture: database_close."),
        false,
      );
    if (mode === "startup-hang")
      assert.equal(child.output.includes(listening), false);
    console.info(
      `${mode}: application watchdog exited 1 in ${Math.round(elapsed)}ms.`,
    );
    await releasedPort(port);
  },
);

it("enforces the real 17s startup watchdog without a harness kill", async () => {
  const start = performance.now();
  const { child, port } = await startChild({}, undefined, "startup-watchdog");
  await child.waitForOutput("Shutdown fixture: startup_pending.");
  await exited(child, 1);
  const elapsed = performance.now() - start;
  assert.ok(elapsed >= 16_900 && elapsed < 18_000);
  assert.equal(lifecycle(child, "startup_timeout").length, 1);
  assert.equal(child.output.includes(listening), false);
  console.info(
    `Startup watchdog: application exited 1 in ${Math.round(elapsed)}ms.`,
  );
  await releasedPort(port);
});

it("recovers exact HTTP readiness after an owned real DB socket disruption", async () => {
  // The child's DATABASE_URL points at this owned loopback gate, which forwards
  // real authenticated traffic to the test database; it never replaces DB
  // responses. Owners are registered before connect/terminate, including
  // failure cleanup.
  let forwarding = true;
  let refused = 0;
  const gate = await listen(0, (socket) => {
    if (!forwarding) {
      refused++;
      socket.destroy();
      return;
    }
    const upstream = createConnection({ host: config.host, port: config.port });
    sockets.add(upstream);
    upstream.once("close", () => {
      sockets.delete(upstream);
      socket.destroy();
    });
    socket.once("close", () => upstream.destroy());
    socket.on("error", () => upstream.destroy());
    upstream.on("error", () => socket.destroy());
    socket.pipe(upstream).pipe(socket);
  });
  const { child, port } = await startChild({
    DATABASE_URL: databaseUrl(gate.port, "127.0.0.1"),
  });
  await child.waitForOutput(listening);
  const pid = child.child.pid;
  assert.ok(pid);
  await health(port, "/health/live", '{"status":"ok"}');
  await health(port, "/health/ready", '{"status":"ready"}');
  const backends = await otherBackends();
  assert.equal(backends.length, 1, "Expected only the owned API backend.");
  const backend = backends[0];
  assert.ok(backend);
  forwarding = false;
  const terminated = await controller.db.$client.query<{ terminated: boolean }>(
    "SELECT pg_terminate_backend($1) AS terminated",
    [backend.pid],
  );
  assert.equal(terminated.rows[0]?.terminated, true);
  await health(port, "/health/live", '{"status":"ok"}');
  const failedMs = await health(
    port,
    "/health/ready",
    '{"status":"unavailable"}',
    503,
  );
  // A second fresh check also proves refusal of a replacement connection,
  // regardless of whether the first observed the terminated or a new socket.
  await health(port, "/health/ready", '{"status":"unavailable"}', 503);
  assert.ok(refused > 0, "No reconnect reached the owned gate.");
  await health(port, "/health/live", '{"status":"ok"}');
  forwarding = true;
  await health(port, "/health/ready", '{"status":"ready"}');
  await health(port, "/health/live", '{"status":"ok"}');
  const recovered = await otherBackends();
  assert.equal(recovered.length, 1);
  assert.notEqual(recovered[0]?.pid, backend.pid);
  assert.equal(child.settled, false, "API exited during DB recovery.");
  assert.equal(child.child.pid, pid);
  process.kill(pid, 0);
  assert.equal(lifecycle(child, "listening").length, 1);
  console.info(
    `Socket recovery: API pid ${pid}, backend ${backend.pid} -> ${recovered[0]?.pid}, ready 503 in ${Math.round(failedMs)}ms, reconnect refusals ${refused}.`,
  );
  child.child.kill("SIGTERM");
  await exited(child, 143);
  await releasedPort(port);
  await closeListener(gate.server);
});

it.each(["SIGINT", "SIGTERM"] as const)(
  "starts built Node, answers exact HTTP and releases resources on %s",
  async (signal) => {
    const { child, port } = await startChild();
    await child.waitForOutput(listening);
    assert.ok(
      (await otherBackends()).length > 0,
      "No authenticated API backend observed.",
    );
    await health(port, "/health/live", '{"status":"ok"}');
    await health(port, "/health/ready", '{"status":"ready"}');
    await health(port, "/health/ready", '{"status":"ready"}');
    const start = performance.now();
    child.child.kill(signal);
    await exited(child, signal === "SIGINT" ? 130 : 143);
    assert.ok(
      performance.now() - start < 10_000,
      "API signal cleanup exceeded 10s.",
    );
    await releasedPort(port);
  },
);

it.each([
  { PORT: "0" },
  { PORT: "" },
  { HOST: "config-secret-sentinel" },
  { LOG_LEVEL: "config-secret-sentinel" },
  { NODE_ENV: "" },
  { DATABASE_URL: undefined },
  { DATABASE_URL: "" },
  { DATABASE_URL: "postgres://config-secret-sentinel@host/database" },
  {
    DATABASE_URL:
      "postgres://storage_minis_app:config-secret-sentinel@127.0.0.1/storage_minis_test",
  },
  {
    DATABASE_URL:
      "mysql://storage_minis_app:config-secret-sentinel@127.0.0.1:5434/storage_minis_test",
  },
  {
    DATABASE_URL:
      "postgres://storage_minis_app:config-secret-sentinel@127.0.0.1:5434/storage_minis_test?sslmode=require",
  },
  { FIREBASE_PROJECT_ID: undefined },
  { FIREBASE_PROJECT_ID: "config-secret-sentinel_" },
  // AU-11's second lock: the test opt-in with production or an unset NODE_ENV.
  { AUTH_TEST_SIGN_IN: "enabled", NODE_ENV: "production" },
  { AUTH_TEST_SIGN_IN: "enabled", NODE_ENV: undefined },
  { BOOTSTRAP_OWNER_EMAIL: "config-secret-sentinel@example.com" },
])("rejects invalid configuration before listening %#", async (overrides) => {
  const { child, port } = await startChild(overrides);
  const start = performance.now();
  await exited(child, 1);
  assert.ok(
    performance.now() - start < 18_000,
    "Invalid configuration exceeded startup bound plus scheduling margin.",
  );
  // The API's own fixed configuration text is logged in every mode.
  const [error, ...causes] = chain(onlyFailure(child, "configuration_failed"));
  assert.equal(error?.type, "ConfigurationError");
  assert.match(
    error.message ?? "",
    /^(Invalid API configuration\. (Check (HOST|PORT|LOG_LEVEL|NODE_ENV|FIREBASE_PROJECT_ID)\.|AUTH_TEST_SIGN_IN requires NODE_ENV development or test\.|Set BOOTSTRAP_OWNER_EMAIL, BOOTSTRAP_ORGANIZATION_NAME and BOOTSTRAP_ORGANIZATION_NICKNAME together, or none of them\.)|DATABASE_URL is required\.|Invalid DATABASE_URL\. Expected postgres:\/\/USER:PASSWORD@HOST:PORT\/DATABASE with optional \?sslmode=disable\|verify-full\.)$/,
  );
  assert.deepEqual(causes, []);
  await releasedPort(port);
});

it.each(["test", "development"])(
  "fails wrong credentials with diagnosable safe bounded startup cleanup (NODE_ENV=%s)",
  async (NODE_ENV) => {
    const wrongPassword = new URL(databaseUrl());
    wrongPassword.password = "invalid-credential-sentinel";
    const { child, port } = await startChild({
      DATABASE_URL: wrongPassword.href,
      NODE_ENV,
    });
    const start = performance.now();
    await exited(child, 1);
    assert.ok(
      performance.now() - start < 18_000,
      "Startup failure exceeded 17s plus 1s scheduling margin.",
    );
    // The DB package wraps pg's DatabaseError; its SQLSTATE survives.
    const errors = chain(onlyFailure(child, "database_readiness_failed"));
    assert.equal(errors[0]?.type, "Error");
    assert.equal(errors[1]?.type, "DatabaseError");
    assert.equal(errors[1].code, "28P01");
    assert.match(errors[1].stack ?? "", /^at /);
    const messages = errors.flatMap((entry) => entry.message ?? []);
    if (NODE_ENV === "development") {
      assert.match(messages.join(" "), /password authentication failed/);
    } else {
      assert.deepEqual(messages, []);
    }
    console.info(`Wrong credentials (${NODE_ENV}): ${child.output.trimEnd()}`);
    await releasedPort(port);
  },
);

it("fails unavailable DB startup using an owned real TCP refusal fixture", async () => {
  let connections = 0;
  const refusal = await listen(0, (socket) => {
    connections++;
    socket.destroy();
  });
  const { child, port } = await startChild({
    DATABASE_URL: databaseUrl(refusal.port, "127.0.0.1"),
  });
  const start = performance.now();
  await exited(child, 1);
  assert.ok(
    performance.now() - start < 18_000,
    "Unavailable startup exceeded 17s plus 1s scheduling margin.",
  );
  assert.ok(connections > 0, "Child did not reach the owned refusal listener.");
  const errors = chain(onlyFailure(child, "database_readiness_failed"));
  assert.ok(errors.length >= 2, "Expected the driver failure as a cause.");
  assert.deepEqual(
    errors.flatMap((entry) => entry.message ?? []),
    [],
  );
  await releasedPort(port);
  await closeListener(refusal.server);
  // Real PostgreSQL was never stopped and remains authenticated/reachable.
  await controller.check();
});

it("fails an occupied port without probing or closing the competing listener", async () => {
  let connections = 0;
  const occupied = await reservePort();
  occupied.server.on("connection", () => {
    connections++;
  });
  const { child } = await startChild({}, occupied);
  const start = performance.now();
  await exited(child, 1);
  assert.ok(
    performance.now() - start < 18_000,
    "Bind failure exceeded 17s plus 1s scheduling margin.",
  );
  assert.equal(onlyFailure(child, "listen_failed").code, "EADDRINUSE");
  assert.equal(connections, 0, "Harness probed the competing listener.");
  assert.equal(occupied.server.listening, true);
  await closeListener(occupied.server);
  await releasedPort(occupied.port);
});
