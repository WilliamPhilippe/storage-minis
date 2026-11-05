import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Database } from "@storage-minis/db";
import { TRPCClientError, createTRPCClient, httpLink } from "@trpc/client";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";
import type { FastifyInstance, LightMyRequestResponse } from "fastify";
import { z } from "zod";
import { unusedAuth } from "../../tests/auth-fakes.js";
import { buildApp } from "../app.js";
import type { ApiConfig } from "../config.js";
import type { AppRouter } from "../types.js";
import { recordProcedure } from "./context.js";
import type { ErrorIssue } from "./errors.js";
import { t } from "./init.js";
import { trpcLimits, trpcRoutes } from "./plugin.js";

// The tRPC modules, like the app, may import only the database type.
vi.mock("@storage-minis/db", () => {
  throw new Error("The tRPC modules must import only the database type.");
});

const secret = "HOSTILE_SECRET_SENTINEL";
const password = "DATABASE_PASSWORD_SENTINEL";
const inputValue = "INPUT_VALUE_SENTINEL";
const httpConfig: ApiConfig["http"] = {
  host: "127.0.0.1",
  port: 3000,
  logLevel: "trace",
  nodeEnv: "test",
};
// Diagnostics never touch Drizzle; identity proves the context passes it on.
const db = { marker: "injected" } as unknown as Database["db"];
// Nothing here verifies a token; identity proves the services pass through.
const auth = unusedAuth();
const apps: FastifyInstance[] = [];
let output: string[];

// Test-only procedures (P5-10): failing, mutating and context-reporting cases
// the production router does not have, mounted through the same plugin.
const procedure = t.procedure.use(recordProcedure);
const take = vi.fn((data: string) => ({ length: data.length }));
const testRouter = t.router({
  take: procedure
    .input(z.strictObject({ data: z.string().max(2 * trpcLimits.bodyBytes) }))
    .output(z.strictObject({ length: z.number() }))
    .mutation(({ input }) => take(input.data)),
  noInput: procedure
    .output(z.strictObject({ ok: z.literal(true) }))
    .mutation(() => ({ ok: true as const })),
  badOutput: procedure
    .output(z.strictObject({ message: z.string() }))
    .query(() => ({ message: 42 }) as unknown as { message: string }),
  fail: procedure.query((): never => {
    throw new Error(`postgres://user:${secret}@host/database`, {
      cause: new Error(`SELECT ${secret}`),
    });
  }),
  context: procedure.query(({ ctx }) => ({
    keys: Object.keys(ctx).sort(),
    injected: ctx.db === db,
    requestId: ctx.requestId,
    auth: {
      keys: Object.keys(ctx.auth).sort(),
      injected:
        ctx.auth.verifier === auth.verifier &&
        ctx.auth.store === auth.store &&
        ctx.auth.bootstrap === auth.bootstrap,
      authorization: ctx.auth.authorization ?? null,
      organizationHeader: ctx.auth.organizationHeader ?? null,
    },
  })),
});
type TestRouter = typeof testRouter;

function createApp(http: ApiConfig["http"] = httpConfig) {
  const app = buildApp(http, {
    database: { db, check: vi.fn<() => Promise<void>>().mockResolvedValue() },
    isClosing: () => false,
    auth,
  });
  void app.register(trpcRoutes, {
    prefix: "/trpc-test",
    router: testRouter,
    db,
    auth,
  });
  apps.push(app);
  return app;
}

type LogRecord = Record<string, unknown> & { err?: Record<string, unknown> };

function records(): LogRecord[] {
  return output
    .join("")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as LogRecord);
}

const messages: Partial<Record<TRPC_ERROR_CODE_KEY, string>> = {
  PARSE_ERROR: "Invalid JSON",
  BAD_REQUEST: "Invalid request",
  NOT_FOUND: "Not found",
  METHOD_NOT_SUPPORTED: "Method not supported",
  PAYLOAD_TOO_LARGE: "Payload too large",
  UNSUPPORTED_MEDIA_TYPE: "Unsupported media type",
  INTERNAL_SERVER_ERROR: "Internal server error",
};

/** The exact envelope: fixed message, numeric code, no stack, cause or path. */
function expectEnvelope(
  response: LightMyRequestResponse,
  status: number,
  code: TRPC_ERROR_CODE_KEY,
  issues?: ErrorIssue[],
) {
  expect(response.statusCode).toBe(status);
  expect(response.headers["content-type"]).toMatch(/^application\/json/);
  expect(response.json()).toEqual({
    error: {
      message: messages[code],
      code: TRPC_ERROR_CODES_BY_KEY[code],
      data: {
        code,
        httpStatus: status,
        ...(issues === undefined ? {} : { issues }),
      },
    },
  });
  expect(response.body).not.toMatch(/stack|cause|"path":"|at /);
}

/** Exactly one request_failed at the approved level, allowlisted err only. */
function expectFailureLog(
  status: number,
  category: string,
  procedureName?: string,
  development = false,
) {
  const failures = records().filter((log) => log.msg === "request_failed");
  expect(failures).toHaveLength(1);
  const [log] = failures;
  if (log === undefined) throw new Error("Expected one request_failed log.");
  expect(log).toMatchObject({
    level: status >= 500 ? 50 : 30,
    category,
    status,
  });
  if (procedureName === undefined) expect(log).not.toHaveProperty("procedure");
  else expect(log.procedure).toBe(procedureName);
  expect(Object.keys(log).sort()).toEqual(
    [
      "category",
      "err",
      "level",
      "msg",
      "reqId",
      "status",
      "time",
      ...(procedureName === undefined ? [] : ["procedure"]),
    ].sort(),
  );
  const allowed = ["type", "code", "stack", "cause"];
  if (development) allowed.push("message");
  for (const key of Object.keys(log.err ?? {})) expect(allowed).toContain(key);
  return log;
}

function expectNoLeaks(response?: LightMyRequestResponse) {
  const logs = output.join("");
  for (const value of [secret, password, inputValue, "DATABASE_URL"]) {
    expect(logs).not.toContain(value);
    if (response) expect(response.body).not.toContain(value);
  }
}

function query(path: string, input?: unknown) {
  const search =
    input === undefined
      ? ""
      : `?input=${encodeURIComponent(JSON.stringify(input))}`;
  return `/trpc/${path}${search}`;
}

beforeEach(() => {
  output = [];
  vi.stubEnv("DATABASE_URL", `postgres://app:${password}@db/storage_minis`);
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
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  }
});

describe("tRPC adapter, production router (plan section 5, cases 1-14)", () => {
  it("1: echoes a valid query through input and output validation", async () => {
    const app = createApp();
    const response = await app.inject(
      query("diagnostics.echo", { message: "ok" }),
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('{"result":{"data":{"message":"ok"}}}');
    expect(response.headers["content-type"]).toBe("application/json");
    const logs = records();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      msg: "request_completed",
      method: "GET",
      route: "/trpc/:path",
      procedure: "diagnostics.echo",
      status: 200,
    });
    expect(Object.keys(logs[0] ?? {}).sort()).toEqual([
      "elapsedMs",
      "level",
      "method",
      "msg",
      "procedure",
      "reqId",
      "route",
      "status",
      "time",
    ]);
  });

  it.each([
    ["2 empty message", { message: "" }, "too_small"],
    ["3 101 characters", { message: inputValue.padEnd(101, "x") }, "too_big"],
    ["4 number", { message: 42 }, "invalid_type"],
  ])("%s: rejects the input value", async (_name, input, code) => {
    const app = createApp();
    const response = await app.inject(query("diagnostics.echo", input));
    expectEnvelope(response, 400, "BAD_REQUEST", [{ path: ["message"], code }]);
    expectFailureLog(400, "bad_request", "diagnostics.echo");
    expect(records().at(-1)).toMatchObject({
      msg: "request_completed",
      procedure: "diagnostics.echo",
      status: 400,
    });
    expectNoLeaks(response);
  });

  it("5: rejects unknown keys without echoing their names or values", async () => {
    const app = createApp();
    const response = await app.inject(
      query("diagnostics.echo", { message: "ok", secret: inputValue }),
    );
    expectEnvelope(response, 400, "BAD_REQUEST", [
      { path: [], code: "unrecognized_keys" },
    ]);
    expect(response.body).not.toContain("secret");
    expectFailureLog(400, "bad_request", "diagnostics.echo");
    expect(output.join("")).not.toContain("secret");
    expectNoLeaks(response);
  });

  it("6: rejects a missing input", async () => {
    const app = createApp();
    const response = await app.inject(query("diagnostics.echo"));
    expectEnvelope(response, 400, "BAD_REQUEST", [
      { path: [], code: "invalid_type" },
    ]);
    expectFailureLog(400, "bad_request", "diagnostics.echo");
  });

  it("7: reports query input that is not JSON as PARSE_ERROR", async () => {
    const app = createApp();
    const response = await app.inject(
      `/trpc/diagnostics.echo?input=not-json-${inputValue}`,
    );
    expectEnvelope(response, 400, "PARSE_ERROR");
    // tRPC's own error (BAD_REQUEST wrapping the SyntaxError) stays in the log.
    expect(
      expectFailureLog(400, "parse_error", "diagnostics.echo").err,
    ).toEqual(
      expect.objectContaining({
        type: "TRPCError",
        code: "BAD_REQUEST",
        cause: expect.objectContaining({ type: "SyntaxError" }) as unknown,
      }),
    );
    expectNoLeaks(response);
  });

  it("8: returns NOT_FOUND for an unknown procedure without echoing or logging its path", async () => {
    const app = createApp();
    const response = await app.inject(`/trpc/diagnostics.${secret}`);
    expectEnvelope(response, 404, "NOT_FOUND");
    expectFailureLog(404, "not_found");
    expect(records().at(-1)).toMatchObject({
      msg: "request_completed",
      route: "/trpc/:path",
      status: 404,
    });
    expect(records().at(-1)).not.toHaveProperty("procedure");
    expectNoLeaks(response);
  });

  it.each(["/trpc", "/trpc/", `/trpc/a/${secret}`])(
    "9: returns the NOT_FOUND envelope for %s",
    async (url) => {
      const app = createApp();
      const response = await app.inject(url);
      expectEnvelope(response, 404, "NOT_FOUND");
      expectFailureLog(404, "not_found");
      expectNoLeaks(response);
    },
  );

  it.each([
    ["10 POST", "POST"],
    ["11 PUT", "PUT"],
  ] as const)(
    "%s: rejects a query called with the wrong method",
    async (_name, method) => {
      const app = createApp();
      const response = await app.inject({
        method,
        url: "/trpc/diagnostics.echo",
        headers: { "content-type": "application/json" },
        payload: { message: inputValue },
      });
      expectEnvelope(response, 405, "METHOD_NOT_SUPPORTED");
      expectFailureLog(405, "method_not_supported");
      expectNoLeaks(response);
    },
  );

  it("12: rejects batch calls", async () => {
    const app = createApp();
    const input = encodeURIComponent(
      JSON.stringify({ 0: { message: "ok" }, 1: { message: "ok" } }),
    );
    const response = await app.inject(
      `/trpc/diagnostics.echo,diagnostics.echo?batch=1&input=${input}`,
    );
    expectEnvelope(response, 400, "BAD_REQUEST");
    expectFailureLog(400, "bad_request");
  });

  it("13: answers a malformed URL under /trpc with the envelope", async () => {
    const app = createApp();
    const response = await app.inject(`/trpc/%E0%A4%A?password=${secret}`);
    expectEnvelope(response, 400, "BAD_REQUEST");
    expectFailureLog(400, "bad_request");
    expectNoLeaks(response);
  });

  it("14: keeps health and non-tRPC bodies unchanged", async () => {
    const app = createApp();
    for (const [url, status, body] of [
      ["/health/live", 200, '{"status":"ok"}'],
      ["/health/ready", 200, '{"status":"ready"}'],
      ["/nope", 404, '{"error":"not_found"}'],
      ["/trpcx/diagnostics.echo", 404, '{"error":"not_found"}'],
      [`/%zz/${secret}`, 400, '{"error":"bad_request"}'],
    ] as const) {
      const response = await app.inject(url);
      expect(response.statusCode).toBe(status);
      expect(response.body).toBe(body);
    }
    for (const log of records()) expect(log).not.toHaveProperty("procedure");
  });

  it("answers HEAD itself with 204 and no body, running no procedure (documented exception)", async () => {
    const app = createApp();
    const response = await app.inject({
      method: "HEAD",
      url: "/trpc/diagnostics.echo",
    });
    expect(response.statusCode).toBe(204);
    expect(response.body).toBe("");
    expect(records().filter((log) => log.msg === "request_failed")).toEqual([]);
    expect(records().at(-1)).not.toHaveProperty("procedure");
  });
});

describe("tRPC adapter, test-only router (plan section 5, cases 15-22)", () => {
  function post(
    path: string,
    payload?: string,
    contentType = "application/json",
  ) {
    return {
      method: "POST" as const,
      url: `/trpc-test/${path}`,
      headers: { "content-type": contentType },
      ...(payload === undefined ? {} : { payload }),
    };
  }

  it("15: rejects a JSON body over 1 MiB with PAYLOAD_TOO_LARGE", async () => {
    const app = createApp();
    const payload = JSON.stringify({
      data: inputValue.padEnd(trpcLimits.bodyBytes, "x"),
    });
    const response = await app.inject(post("take", payload));
    expectEnvelope(response, 413, "PAYLOAD_TOO_LARGE");
    expect(take).not.toHaveBeenCalled();
    expect(expectFailureLog(413, "payload_too_large").err).toMatchObject({
      type: "TRPCError",
      code: "PAYLOAD_TOO_LARGE",
      cause: { type: "FastifyError", code: "FST_ERR_CTP_BODY_TOO_LARGE" },
    });
    expectNoLeaks(response);
  });

  it("16: accepts bodies above the app's 16 KiB default, up to exactly 1 MiB", async () => {
    const app = createApp();
    const wrapper = JSON.stringify({ data: "" }).length;
    for (const bytes of [20 * 1024, trpcLimits.bodyBytes]) {
      const length = bytes - wrapper;
      const payload = JSON.stringify({ data: "x".repeat(length) });
      expect(Buffer.byteLength(payload)).toBe(bytes);
      const response = await app.inject(post("take", payload));
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ result: { data: { length } } });
    }
    expect(records().filter((log) => log.msg === "request_failed")).toEqual([]);
  });

  it("17: treats an empty JSON body as no input for a mutation", async () => {
    const app = createApp();
    const response = await app.inject(post("noInput"));
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('{"result":{"data":{"ok":true}}}');
  });

  it.each([
    ["18 malformed JSON", `{"data":"${inputValue}"`],
    ["prototype poisoning", `{"data":"x","__proto__":{"${secret}":1}}`],
  ])(
    "%s: returns PARSE_ERROR from Fastify's parser",
    async (_name, payload) => {
      const app = createApp();
      const response = await app.inject(post("take", payload));
      expectEnvelope(response, 400, "PARSE_ERROR");
      expect(expectFailureLog(400, "parse_error").err).toMatchObject({
        cause: { code: "FST_ERR_CTP_INVALID_JSON_BODY" },
      });
      expectNoLeaks(response);
    },
  );

  it.each([
    `text/plain; charset=${secret}`,
    `multipart/form-data; boundary=${secret}`,
    `application/${secret}`,
  ])("19: rejects %s with UNSUPPORTED_MEDIA_TYPE", async (contentType) => {
    const app = createApp();
    const response = await app.inject(
      post("take", `--${secret}--\r\n`, contentType),
    );
    expectEnvelope(response, 415, "UNSUPPORTED_MEDIA_TYPE");
    expectFailureLog(415, "unsupported_media_type");
    expectNoLeaks(response);
  });

  it("20: turns an output-validation failure into a fixed 500", async () => {
    const app = createApp();
    const response = await app.inject("/trpc-test/badOutput");
    expectEnvelope(response, 500, "INTERNAL_SERVER_ERROR");
    expect(
      expectFailureLog(500, "internal_error", "badOutput").err,
    ).toMatchObject({
      type: "TRPCError",
      code: "INTERNAL_SERVER_ERROR",
      cause: { type: "ZodError" },
    });
  });

  it("21: hides an unexpected error's message and cause outside development", async () => {
    const app = createApp();
    const response = await app.inject("/trpc-test/fail");
    expectEnvelope(response, 500, "INTERNAL_SERVER_ERROR");
    const log = expectFailureLog(500, "internal_error", "fail");
    expect(log.err).toMatchObject({
      type: "TRPCError",
      code: "INTERNAL_SERVER_ERROR",
      cause: { type: "Error", cause: { type: "Error" } },
    });
    expect(log.err).not.toHaveProperty("message");
    expect(output.join("")).not.toMatch(/postgres:|SELECT/);
    expectNoLeaks(response);
  });

  it("21: logs the messages in development only, never in the response", async () => {
    const app = createApp({ ...httpConfig, nodeEnv: "development" });
    const response = await app.inject("/trpc-test/fail");
    expectEnvelope(response, 500, "INTERNAL_SERVER_ERROR");
    expect(response.body).not.toContain(secret);
    expect(
      expectFailureLog(500, "internal_error", "fail", true).err,
    ).toMatchObject({
      message: `postgres://user:${secret}@host/database`,
      cause: { cause: { message: `SELECT ${secret}` } },
    });
  });

  it("22: builds the context from the injected services, the request ID and the raw sign-in headers", async () => {
    const app = createApp();
    const response = await app.inject({
      url: "/trpc-test/context",
      headers: { authorization: "Bearer raw", "x-organization-id": "12" },
    });
    expect(response.statusCode).toBe(200);
    const { result } = response.json<{
      result: {
        data: {
          keys: string[];
          injected: boolean;
          requestId: string;
          auth: Record<string, unknown>;
        };
      };
    }>();
    expect(result.data.keys).toEqual(["auth", "db", "requestId"]);
    expect(result.data.injected).toBe(true);
    // Unverified input, read only by the guarded builders (SI-06).
    expect(result.data.auth).toEqual({
      keys: [
        "authorization",
        "bootstrap",
        "organizationHeader",
        "store",
        "verifier",
      ],
      injected: true,
      authorization: "Bearer raw",
      organizationHeader: "12",
    });
    expect(auth.verifier.verify).not.toHaveBeenCalled();
    expect(records()[0]).toMatchObject({
      msg: "request_completed",
      procedure: "context",
      reqId: result.data.requestId,
    });
    expect(result.data.requestId).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe("tRPC client over loopback HTTP", () => {
  async function listen() {
    const app = createApp();
    await app.listen({ host: "127.0.0.1", port: 0 });
    const { port } = app.server.address() as AddressInfo;
    const base = `http://127.0.0.1:${port}`;
    return {
      client: createTRPCClient<AppRouter>({
        links: [httpLink({ url: `${base}/trpc` })],
      }),
      testClient: createTRPCClient<TestRouter>({
        links: [httpLink({ url: `${base}/trpc-test` })],
      }),
    };
  }

  async function rejection(promise: Promise<unknown>) {
    const error = await promise.then(
      () => undefined,
      (caught: unknown) => caught,
    );
    expect(error).toBeInstanceOf(TRPCClientError);
    return error as TRPCClientError<AppRouter>;
  }

  it("calls queries and mutations and reads typed error data", async () => {
    const { client, testClient } = await listen();
    await expect(
      client.diagnostics.echo.query({ message: "ok" }),
    ).resolves.toEqual({ message: "ok" });

    const invalid = await rejection(
      client.diagnostics.echo.query({ message: "" }),
    );
    expect(invalid.message).toBe("Invalid request");
    // Typed through AppRouter's error shape.
    const issues: ErrorIssue[] | undefined = invalid.data?.issues;
    expect(invalid.data?.code).toBe("BAD_REQUEST");
    expect(invalid.data?.httpStatus).toBe(400);
    expect(issues).toEqual([{ path: ["message"], code: "too_small" }]);

    await expect(testClient.noInput.mutate()).resolves.toEqual({ ok: true });

    // Fastify rejects an over-limit Content-Length unread and closes the
    // connection; a client still uploading may see the reset before the 413
    // (documented exception, approved 2026-11-01). Either way it never runs.
    const tooLarge = await rejection(
      testClient.take.mutate({ data: "x".repeat(trpcLimits.bodyBytes) }),
    );
    if (tooLarge.data) {
      expect(tooLarge.message).toBe("Payload too large");
      expect(tooLarge.data.code).toBe("PAYLOAD_TOO_LARGE");
      expect(tooLarge.data.httpStatus).toBe(413);
    } else {
      const reset = (
        tooLarge.cause as { cause?: { code?: unknown } } | undefined
      )?.cause?.code;
      expect(reset).toMatch(/^(ECONNRESET|EPIPE)$/);
    }
    expect(take).not.toHaveBeenCalled();

    const internal = await rejection(testClient.fail.query());
    expect(internal.message).toBe("Internal server error");
    expect(internal.data?.code).toBe("INTERNAL_SERVER_ERROR");
    expect(JSON.stringify(internal.shape)).not.toContain(secret);
    expectNoLeaks();
  });
});
