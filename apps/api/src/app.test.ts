import { Server, Socket } from "node:net";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "./app.js";
import type { AppDependencies } from "./app.js";
import type { ApiConfig } from "./config.js";

// A runtime import would allow construction to acquire a pool accidentally.
vi.mock("@storage-minis/db", () => {
  throw new Error("The HTTP factory must import only the database type.");
});

const httpConfig: ApiConfig["http"] = {
  host: "127.0.0.1",
  port: 3000,
  logLevel: "trace",
  nodeEnv: "test",
};
const secret = "HOSTILE_SECRET_SENTINEL";
const requestId = "HOSTILE_REQUEST_ID_SENTINEL";
const apps: FastifyInstance[] = [];
let output: string[];

function createApp(overrides: Partial<AppDependencies> = {}) {
  const check = vi.fn<() => Promise<void>>().mockResolvedValue();
  const app = buildApp(httpConfig, {
    database: { check },
    isClosing: () => false,
    ...overrides,
  });
  apps.push(app);
  return { app, check };
}

function records(): Record<string, unknown>[] {
  return output
    .join("")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      return JSON.parse(line) as Record<string, unknown>;
    });
}

beforeEach(() => {
  output = [];
  vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
    output.push(String(chunk));
    return true;
  });
});

afterEach(async () => {
  try {
    for (const app of apps) await app.close();
  } finally {
    apps.length = 0;
    vi.restoreAllMocks();
  }
});

describe("HTTP factory", () => {
  it("imports and constructs without reading environment or acquiring process/network/DB resources", async () => {
    vi.resetModules();
    const connect = vi.spyOn(Socket.prototype, "connect");
    const listen = vi.spyOn(Server.prototype, "listen");
    const on = vi.spyOn(process, "on");
    const addListener = vi.spyOn(process, "addListener");
    const originalEnvironment = process.env;
    const reads: PropertyKey[] = [];
    let app: FastifyInstance | undefined;
    try {
      process.env = new Proxy(originalEnvironment, {
        get(target, key, receiver) {
          // Node's module loader consults only these instrumentation switches.
          // Keep every application/DB setting (including NODE_ENV) guarded.
          if (
            key !== "WATCH_REPORT_DEPENDENCIES" &&
            key !== "NODE_V8_COVERAGE"
          ) {
            reads.push(key);
          }
          return Reflect.get(target, key, receiver) as unknown;
        },
      });
      const imported = await import("./app.js");
      app = imported.buildApp(httpConfig, {
        database: { check: vi.fn() },
        isClosing: () => false,
      });
      apps.push(app);
    } finally {
      process.env = originalEnvironment;
    }
    expect(reads).toEqual([]);
    expect(connect).not.toHaveBeenCalled();
    expect(listen).not.toHaveBeenCalled();
    expect(on).not.toHaveBeenCalled();
    expect(addListener).not.toHaveBeenCalled();
    expect(app?.server.listening).toBe(false);
    expect(app?.initialConfig).toMatchObject({
      bodyLimit: 16 * 1024,
      requestTimeout: 10_000,
      forceCloseConnections: "idle",
    });
  });

  it("returns exact liveness without checking the DB, including failure and closing", async () => {
    const check = vi
      .fn<() => Promise<void>>()
      .mockRejectedValue(new Error(secret));
    const { app } = createApp({ database: { check }, isClosing: () => true });
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await app.inject("/health/live");
      expect(response.statusCode).toBe(200);
      expect(response.body).toBe('{"status":"ok"}');
    }
    expect(check).not.toHaveBeenCalled();
  });

  it("checks readiness afresh and recovers after failure without rebuilding", async () => {
    const { app, check } = createApp();
    check
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error(secret))
      .mockResolvedValueOnce();
    for (const [status, body] of [
      [200, '{"status":"ready"}'],
      [503, '{"status":"unavailable"}'],
      [200, '{"status":"ready"}'],
    ] as const) {
      const response = await app.inject("/health/ready");
      expect(response.statusCode).toBe(status);
      expect(response.body).toBe(body);
    }
    expect(check).toHaveBeenCalledTimes(3);
    expect(records()).toContainEqual(
      expect.objectContaining({
        category: "database_unavailable",
        status: 503,
      }),
    );
    expect(output.join("")).not.toContain(secret);
  });

  it("skips DB work while closing and rejects a success that finishes after closing begins", async () => {
    let closing = false;
    let finishCheck: (() => void) | undefined;
    const checkStarted = Promise.withResolvers<void>();
    const check = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishCheck = resolve;
          checkStarted.resolve();
        }),
    );
    const { app } = createApp({
      database: { check },
      isClosing: () => closing,
    });
    const pending = app.inject("/health/ready");
    // Injection is lazy until awaited/then-ed.
    const responsePromise = pending.then((response) => response);
    await checkStarted.promise;
    closing = true;
    finishCheck?.();
    const response = await responsePromise;
    expect(response.statusCode).toBe(503);
    expect(response.body).toBe('{"status":"unavailable"}');
    const next = await app.inject("/health/ready");
    expect(next.statusCode).toBe(503);
    expect(next.body).toBe('{"status":"unavailable"}');
    expect(check).toHaveBeenCalledTimes(1);
  });

  it("uses generated unique IDs, fixed unmatched labels and only allowlisted request metadata", async () => {
    const { app } = createApp();
    app.get("/fixture/:id", () => Promise.resolve({ status: "ok" }));
    for (const url of [
      `/health/live?password=${secret}`,
      `/fixture/${secret}?query=${secret}`,
      `/${secret}?query=${secret}`,
    ]) {
      const response = await app.inject({
        url,
        headers: {
          authorization: `Bearer ${secret}`,
          cookie: `session=${secret}`,
          "x-request-id": requestId,
          "x-forwarded-for": secret,
          "x-forwarded-host": secret,
        },
      });
      expect(response.body).not.toContain(secret);
      expect(response.body).not.toContain(requestId);
      if (response.statusCode === 404)
        expect(response.body).toBe('{"error":"not_found"}');
    }
    const logs = records();
    expect(logs).toHaveLength(3);
    expect(logs.map((log) => log.route)).toEqual([
      "/health/live",
      "/fixture/:id",
      "unmatched",
    ]);
    expect(new Set(logs.map((log) => log.reqId)).size).toBe(3);
    for (const log of logs) {
      expect(Object.keys(log).sort()).toEqual([
        "elapsedMs",
        "level",
        "method",
        "msg",
        "reqId",
        "route",
        "status",
        "time",
      ]);
      expect(log.reqId).toMatch(/^[0-9a-f-]{36}$/);
      expect(log.method).toBe("GET");
      expect(log.elapsedMs).toEqual(expect.any(Number));
    }
    expect(output.join("")).not.toContain(secret);
    expect(output.join("")).not.toContain(requestId);
  });

  it("returns safe unexpected errors and never serializes messages, stacks, causes or bodies", async () => {
    const { app } = createApp();
    app.post("/fixture", () =>
      Promise.reject(
        new Error(`postgres://user:${secret}@host/database`, {
          cause: new Error(`SELECT ${secret}`),
        }),
      ),
    );
    const response = await app.inject({
      method: "POST",
      url: `/fixture?query=${secret}`,
      payload: { password: secret },
      headers: {
        authorization: secret,
        cookie: secret,
        "x-request-id": requestId,
      },
    });
    expect(response.statusCode).toBe(500);
    expect(response.body).toBe('{"error":"internal_error"}');
    expect(output.join("")).not.toContain(secret);
    expect(output.join("")).not.toContain(requestId);
    expect(output.join("")).not.toMatch(
      /stack|cause|postgres:|SELECT|password|headers|body/,
    );
    expect(records()).toContainEqual(
      expect.objectContaining({ category: "internal_error", status: 500 }),
    );
  });

  it.each([
    ["malformed JSON", "application/json", `{"${secret}":`, 400, "bad_request"],
    ["empty JSON", "application/json", "", 400, "bad_request"],
    [
      "oversized JSON",
      "application/json",
      JSON.stringify({ data: secret.repeat(1000) }),
      413,
      "payload_too_large",
    ],
    [
      "unsupported media",
      `application/${secret}`,
      secret,
      415,
      "unsupported_media_type",
    ],
  ])(
    "preserves safe framework status for %s",
    async (_name, contentType, payload, status, category) => {
      const { app } = createApp();
      const handler = vi.fn(() => Promise.resolve({ status: "unexpected" }));
      app.post("/fixture", handler);
      const response = await app.inject({
        method: "POST",
        url: `/fixture?query=${secret}`,
        payload,
        headers: {
          "content-type": contentType,
          authorization: secret,
          cookie: secret,
          "x-request-id": requestId,
        },
      });
      expect(response.statusCode).toBe(status);
      expect(response.body).toBe(JSON.stringify({ error: category }));
      expect(handler).not.toHaveBeenCalled();
      expect(output.join("")).not.toContain(secret);
      expect(output.join("")).not.toContain(requestId);
    },
  );

  it("sanitizes malformed URLs before normal routing and logging hooks", async () => {
    const { app } = createApp();
    const response = await app.inject(`/%zz/${secret}?password=${secret}`);
    expect(response.statusCode).toBe(400);
    expect(response.body).toBe('{"error":"bad_request"}');
    expect(output.join("")).not.toContain(secret);
  });

  it("preserves other client-error statuses with a fixed category and handles non-Error throws", async () => {
    const { app } = createApp();
    app.get("/client-error", () =>
      Promise.reject(
        Object.assign(new Error(secret), {
          statusCode: 422,
          headers: { "x-secret": secret },
        }),
      ),
    );
    app.get(
      "/non-error",
      vi.fn<() => Promise<never>>().mockRejectedValue(secret),
    );
    const clientError = await app.inject("/client-error");
    expect(clientError.statusCode).toBe(422);
    expect(clientError.body).toBe('{"error":"request_error"}');
    expect(clientError.headers).not.toHaveProperty("x-secret");
    const unexpected = await app.inject("/non-error");
    expect(unexpected.statusCode).toBe(500);
    expect(unexpected.body).toBe('{"error":"internal_error"}');
    expect(output.join("")).not.toContain(secret);
  });

  it("does not trust forwarded addresses and accepts a body at the exact byte limit", async () => {
    const { app } = createApp();
    app.post("/fixture", (request, reply) => reply.send({ ip: request.ip }));
    const response = await app.inject({
      method: "POST",
      url: "/fixture",
      headers: { "content-type": "text/plain", "x-forwarded-for": secret },
      payload: "x".repeat(16 * 1024),
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ip: "127.0.0.1" });
    const oversized = await app.inject({
      method: "POST",
      url: "/fixture",
      headers: { "content-type": "text/plain" },
      payload: "x".repeat(16 * 1024 + 1),
    });
    expect(oversized.statusCode).toBe(413);
    expect(oversized.body).toBe('{"error":"payload_too_large"}');
  });

  it("keeps framework request/response/error serializers safe", async () => {
    const { app } = createApp();
    app.get("/fixture/:id", async (request, reply) => {
      request.log.error(
        { req: request, res: reply, err: new Error(secret, { cause: secret }) },
        "fixture_failure",
      );
      return { status: "ok" };
    });
    await app.inject(`/fixture/${secret}?password=${secret}`);
    expect(records()[0]).toMatchObject({
      req: { method: "GET", route: "/fixture/:id" },
      res: { status: 200 },
      err: { category: "internal_error" },
    });
    expect(output.join("")).not.toContain(secret);
  });
});
