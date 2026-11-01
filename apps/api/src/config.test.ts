import { Server, Socket } from "node:net";
import { describe, expect, it, vi } from "vitest";
import { readApiConfig } from "./config.js";

const password = "fixture-secret-@:$'\\\n";
const environment = {
  DATABASE_URL: `postgres://storage_minis_app:${encodeURIComponent(password)}@127.0.0.1:5434/storage_minis_test`,
};

describe("API configuration", () => {
  it("defaults only absent HTTP values and ignores unrelated environment keys", () => {
    expect(readApiConfig({ ...environment, UNRELATED: "ignored" })).toEqual({
      http: {
        host: "127.0.0.1",
        port: 3000,
        logLevel: "info",
        nodeEnv: "development",
      },
      database: {
        host: "127.0.0.1",
        port: 5434,
        database: "storage_minis_test",
        user: "storage_minis_app",
        password,
        sslmode: "disable",
      },
    });
  });

  it("accepts explicit HTTP boundaries, every level/environment, and an in-network URL", () => {
    for (const PORT of ["1", "3000", "65535"]) {
      for (const LOG_LEVEL of [
        "fatal",
        "error",
        "warn",
        "info",
        "debug",
        "trace",
        "silent",
      ]) {
        for (const NODE_ENV of ["development", "test", "production"]) {
          expect(
            readApiConfig({
              HOST: "0.0.0.0",
              PORT,
              LOG_LEVEL,
              NODE_ENV,
              DATABASE_URL:
                "postgres://storage_minis_app:fixture@postgres:5432/storage_minis?sslmode=disable",
            }),
          ).toMatchObject({
            http: {
              host: "0.0.0.0",
              port: Number(PORT),
              logLevel: LOG_LEVEL,
              nodeEnv: NODE_ENV,
            },
            database: { host: "postgres", database: "storage_minis" },
          });
        }
      }
    }
  });

  it.each([
    ["HOST", ["", " ", "localhost", "::1", "example.com"]],
    [
      "PORT",
      [
        "",
        " ",
        "0",
        "65536",
        "99999999999999999",
        "03000",
        "-1",
        "+1",
        "1.0",
        "1e3",
        " 3000",
        "3000\n",
        "3000x",
      ],
    ],
    ["LOG_LEVEL", ["", " ", "INFO", "verbose"]],
    ["NODE_ENV", ["", " ", "staging", "Production"]],
  ])(
    "rejects invalid %s values with only a safe field name",
    (field, values) => {
      for (const value of values) {
        expect(() => readApiConfig({ ...environment, [field]: value })).toThrow(
          `Invalid API configuration. Check ${field}.`,
        );
      }
    },
  );

  it("never includes values, Zod issues or causes in HTTP failures", () => {
    const sentinel = "private-sentinel";
    try {
      readApiConfig({
        ...environment,
        HOST: sentinel,
        PORT: sentinel,
        LOG_LEVEL: sentinel,
        NODE_ENV: sentinel,
      });
      expect.fail("expected validation failure");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(String(error)).toBe(
        "Error: Invalid API configuration. Check HOST, PORT, LOG_LEVEL, NODE_ENV.",
      );
      expect(error).not.toHaveProperty("cause");
      expect(error).not.toHaveProperty("issues");
      expect(String(error)).not.toContain(sentinel);
      expect(String(error)).not.toContain(password);
    }
  });

  it("inherits DATABASE_URL validation without leaking secrets", () => {
    expect(() => readApiConfig({})).toThrow("DATABASE_URL is required.");
    for (const DATABASE_URL of [
      "postgres://private-sentinel",
      "postgres://storage_minis_app:private-sentinel@127.0.0.1/storage_minis_test",
      "postgres://storage_minis_app@127.0.0.1:5434/storage_minis_test",
      "postgres://storage_minis_app:private-sentinel@127.0.0.1:5434/",
      "postgres://storage_minis_app:private-sentinel@127.0.0.1:5434/storage_minis_test?sslmode=require",
      "mysql://storage_minis_app:private-sentinel@127.0.0.1:5434/storage_minis_test",
    ]) {
      let failure: unknown;
      try {
        readApiConfig({ DATABASE_URL });
      } catch (error) {
        failure = error;
      }
      expect(String(failure)).toBe(
        "Error: Invalid DATABASE_URL. Expected postgres://USER:PASSWORD@HOST:PORT/DATABASE with optional ?sslmode=disable|verify-full.",
      );
    }
  });

  it("imports without reading configuration, connecting, listening or installing handlers", async () => {
    vi.resetModules();
    vi.stubEnv("HOST", "invalid-import-sentinel");
    vi.stubEnv("DATABASE_URL", "private-import-sentinel");
    const connect = vi.spyOn(Socket.prototype, "connect");
    const listen = vi.spyOn(Server.prototype, "listen");
    const on = vi.spyOn(process, "on");
    try {
      const imported = await import("./config.js");
      expect(imported.readApiConfig(environment).http.port).toBe(3000);
      expect(connect).not.toHaveBeenCalled();
      expect(listen).not.toHaveBeenCalled();
      expect(
        on.mock.calls.filter(
          ([event]) => event === "SIGINT" || event === "SIGTERM",
        ),
      ).toEqual([]);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
