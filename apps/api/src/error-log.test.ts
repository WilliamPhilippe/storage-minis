import { describe, expect, it } from "vitest";
import {
  ConfigurationError,
  errorLogLimits,
  isDevelopment,
  lifecycleLine,
  serializeError,
} from "./error-log.js";

const secret = "HOSTILE_SECRET_SENTINEL";
const production = { messages: false };
const development = { messages: true };

/** Shaped like pg's DatabaseError: message, SQLSTATE and value-bearing fields. */
function postgresError() {
  return Object.assign(
    new Error(`duplicate key value violates unique constraint "${secret}"`),
    {
      code: "23505",
      severity: "ERROR",
      detail: `Key (sku)=(${secret}) already exists.`,
      constraint: secret,
      table: secret,
      where: secret,
    },
  );
}

describe("allowlisted error serializer", () => {
  it("keeps only type, code and stack frames outside development", () => {
    const error = postgresError();
    const log = serializeError(error, production);
    expect(Object.keys(log).sort()).toEqual(["code", "stack", "type"]);
    expect(log).toMatchObject({ type: "Error", code: "23505" });
    expect(log.stack).toMatch(/^at /);
    expect(JSON.stringify(log)).not.toContain(secret);
  });

  it("adds messages in development but never other error properties", () => {
    const log = serializeError(postgresError(), development);
    expect(Object.keys(log).sort()).toEqual([
      "code",
      "message",
      "stack",
      "type",
    ]);
    expect(log.message).toContain("duplicate key value");
    expect(JSON.stringify(log)).not.toMatch(
      /"(detail|severity|constraint|table|where)"|already exists/,
    );
  });

  it("follows the DB package's wrapper to the Postgres cause", () => {
    const wrapped = new Error("Database check failed.", {
      cause: Object.assign(new Error(`password for ${secret} failed`), {
        code: "28P01",
      }),
    });
    expect(serializeError(wrapped, production)).toMatchObject({
      type: "Error",
      cause: { type: "Error", code: "28P01" },
    });
    expect(JSON.stringify(serializeError(wrapped, production))).not.toContain(
      secret,
    );
  });

  it("never logs a URL parser's input, even in development", () => {
    let failure: unknown;
    try {
      new URL(`postgres://user:${secret}@[bad`);
    } catch (error) {
      failure = error;
    }
    const log = serializeError(failure, development);
    expect(log).toMatchObject({ type: "TypeError", code: "ERR_INVALID_URL" });
    expect(failure).toHaveProperty("input");
    expect(JSON.stringify(log)).not.toContain(secret);
  });

  it("keeps only frame lines, so a multi-line message cannot leak through the stack", () => {
    const error = new Error(`first line\n${secret}\n  continued ${secret}`);
    const log = serializeError(error, production);
    expect(log.stack?.split("\n").every((line) => line.startsWith("at "))).toBe(
      true,
    );
    expect(JSON.stringify(log)).not.toContain(secret);
  });

  it("bounds frames and cause depth", () => {
    const error = new Error("x");
    error.stack = `Error: x\n${"    at frame (file.js:1:1)\n".repeat(50)}`;
    expect(serializeError(error, production).stack?.split("\n")).toHaveLength(
      errorLogLimits.frames,
    );
    let chain: Error = new Error("deepest");
    for (let level = 0; level < 6; level += 1)
      chain = new Error(String(level), { cause: chain });
    let depth = 0;
    for (
      let log = serializeError(chain, production).cause;
      log;
      log = log.cause
    )
      depth += 1;
    expect(depth).toBe(errorLogLimits.causeDepth);
  });

  it("drops non-string or unbounded codes and names a thrown value only by type", () => {
    expect(
      serializeError(Object.assign(new Error(), { code: 42 }), production),
    ).not.toHaveProperty("code");
    expect(
      serializeError(
        Object.assign(new Error(), { code: `bad ${secret}` }),
        production,
      ),
    ).not.toHaveProperty("code");
    expect(serializeError(secret, development)).toEqual({ type: "string" });
    expect(serializeError(null, development)).toEqual({ type: "null" });
    expect(serializeError({ message: secret }, production)).toEqual({
      type: "Object",
    });
  });

  it("survives hostile getters and constructors", () => {
    const hostile = new Proxy(new Error(secret), {
      get(target, key) {
        if (key === "constructor" || key === "code" || key === "stack")
          throw new Error(secret);
        return Reflect.get(target, key) as unknown;
      },
    });
    expect(serializeError(hostile, production)).toEqual({ type: "Object" });
  });

  it("logs the API's own configuration messages in every mode", () => {
    const error = new ConfigurationError(
      "Invalid API configuration. Check PORT.",
    );
    expect(serializeError(error, production)).toMatchObject({
      type: "ConfigurationError",
      message: "Invalid API configuration. Check PORT.",
    });
  });

  it("detects development only from the exact value", () => {
    expect(isDevelopment({ NODE_ENV: "development" })).toBe(true);
    for (const NODE_ENV of [undefined, "", "Development", "production", "test"])
      expect(isDevelopment({ NODE_ENV })).toBe(false);
  });
});

describe("lifecycle lines", () => {
  it("writes one JSON line shaped like the request logs", () => {
    const listening = lifecycleLine("listening", undefined, production);
    expect(listening.endsWith("}\n")).toBe(true);
    expect(listening.trim().split("\n")).toHaveLength(1);
    const parsed = JSON.parse(listening) as Record<string, unknown>;
    expect(Object.keys(parsed).sort()).toEqual(["level", "msg", "time"]);
    expect(parsed).toMatchObject({ level: 30, msg: "listening" });
    expect(parsed.time).toEqual(expect.any(Number));
  });

  it("logs failures at error with the allowlisted cause chain", () => {
    const line = lifecycleLine(
      "database_readiness_failed",
      new Error(`Database check failed ${secret}`, { cause: postgresError() }),
      production,
    );
    expect(JSON.parse(line)).toMatchObject({
      level: 50,
      msg: "database_readiness_failed",
      err: { type: "Error", cause: { code: "23505" } },
    });
    expect(line).not.toContain(secret);
    expect(lifecycleLine("startup_timeout", undefined, production)).toMatch(
      /^\{"level":50,"time":\d+,"msg":"startup_timeout"\}\n$/,
    );
  });
});
