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
import { ownProcess } from "../scripts/owned-process.js";
import type { OwnedProcess } from "../scripts/owned-process.js";

// Guard even direct imports before acquiring any controller or cleanup owner.
const config = readDatabaseConfig(process.env);
requireTestDatabase(config);
const cwd = new URL("..", import.meta.url);
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
  preload = false,
  occupied?: Awaited<ReturnType<typeof reservePort>>,
) {
  const reservation = occupied ?? (await reservePort());
  // The actual entry requires 1..65535. Transfer a reserved port, then require
  // THIS child's success marker before probing; a competing bind fails closed.
  if (!occupied) await closeListener(reservation.server);
  const child = ownProcess(
    [
      "--enable-source-maps",
      ...(preload
        ? ["--import", "./tests/fixtures/unavailable-database.ts"]
        : []),
      "dist/server.js",
    ],
    {
      cwd,
      env: {
        DB_TARGET: config.target,
        PGHOST: config.host,
        PGPORT: String(config.port),
        PGDATABASE: config.database,
        PGUSER: config.user,
        PGPASSWORD: config.password,
        HOST: "127.0.0.1",
        PORT: String(reservation.port),
        LOG_LEVEL: "silent",
        NODE_ENV: "test",
        TZ: "UTC",
        ...overrides,
      },
      deadlineMs: 20_000,
      killAfterMs: 1_000,
    },
  );
  children.add(child);
  return { child, port: reservation.port };
}

function safeOutput(child: OwnedProcess) {
  for (const secret of [
    config.password,
    "invalid-credential-sentinel",
    "config-secret-sentinel",
    "postgres://",
  ])
    assert.equal(
      child.output.includes(secret),
      false,
      "API exposed supplied secret data.",
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

it("recovers exact HTTP readiness after an owned real DB socket disruption", async () => {
  // The existing child-only DNS preload routes the exact validated test host to
  // this gate. Forward real authenticated traffic; never replace DB responses.
  // Owners are registered before connect/terminate, including failure cleanup.
  let forwarding = true;
  let refused = 0;
  const gate = await listen(5432, (socket) => {
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
  const { child, port } = await startChild({}, true);
  await child.waitForOutput("API lifecycle: listening.");
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
  assert.equal(child.output.split("API lifecycle: listening.").length, 2);
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
    await child.waitForOutput("API lifecycle: listening.");
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
  { DB_TARGET: undefined },
  { PGPASSWORD: undefined },
  { PGPASSWORD: "" },
  { PGHOST: "postgres" },
  { DATABASE_URL: "postgres://config-secret-sentinel@host/database" },
])("rejects invalid configuration before listening %#", async (overrides) => {
  const { child, port } = await startChild(overrides);
  const start = performance.now();
  await exited(child, 1);
  assert.ok(
    performance.now() - start < 18_000,
    "Invalid configuration exceeded startup bound plus scheduling margin.",
  );
  assert.equal(child.output, "API lifecycle: configuration_failed.\n");
  await releasedPort(port);
});

it("fails wrong credentials with safe bounded startup cleanup", async () => {
  const { child, port } = await startChild({
    PGPASSWORD: "invalid-credential-sentinel",
  });
  const start = performance.now();
  await exited(child, 1);
  assert.ok(
    performance.now() - start < 18_000,
    "Startup failure exceeded 17s plus 1s scheduling margin.",
  );
  assert.equal(child.output, "API lifecycle: database_readiness_failed.\n");
  await releasedPort(port);
});

it("fails unavailable DB startup using an owned real TCP refusal fixture", async () => {
  let connections = 0;
  const refusal = await listen(5432, (socket) => {
    connections++;
    socket.destroy();
  });
  const { child, port } = await startChild({}, true);
  const start = performance.now();
  await exited(child, 1);
  assert.ok(
    performance.now() - start < 18_000,
    "Unavailable startup exceeded 17s plus 1s scheduling margin.",
  );
  assert.ok(connections > 0, "Child did not reach the owned refusal listener.");
  assert.equal(child.output, "API lifecycle: database_readiness_failed.\n");
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
  const { child } = await startChild({}, false, occupied);
  const start = performance.now();
  await exited(child, 1);
  assert.ok(
    performance.now() - start < 18_000,
    "Bind failure exceeded 17s plus 1s scheduling margin.",
  );
  assert.equal(child.output, "API lifecycle: listen_failed.\n");
  assert.equal(connections, 0, "Harness probed the competing listener.");
  assert.equal(occupied.server.listening, true);
  await closeListener(occupied.server);
  await releasedPort(occupied.port);
});
