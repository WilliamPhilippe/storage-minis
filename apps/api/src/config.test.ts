import { Server, Socket } from "node:net";
import { describe, expect, it, vi } from "vitest";
import { readApiConfig } from "./config.js";

const environment = {
  DB_TARGET: "test",
  PGHOST: "postgres_test",
  PGPORT: "5432",
  PGDATABASE: "storage_minis_test",
  PGUSER: "postgres",
  PGPASSWORD: "fixture-secret-@:$'\\\n",
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
        target: "test",
        host: "postgres_test",
        port: 5432,
        database: "storage_minis_test",
        user: "postgres",
        password: environment.PGPASSWORD,
      },
    });
  });

  it("accepts explicit HTTP boundaries, every level/environment, and the dev tuple", () => {
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
              ...environment,
              HOST: "0.0.0.0",
              PORT,
              LOG_LEVEL,
              NODE_ENV,
              DB_TARGET: "dev",
              PGHOST: "postgres",
              PGDATABASE: "storage_minis_dev",
            }),
          ).toMatchObject({
            http: {
              host: "0.0.0.0",
              port: Number(PORT),
              logLevel: LOG_LEVEL,
              nodeEnv: NODE_ENV,
            },
            database: { target: "dev" },
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
      expect(String(error)).not.toContain(environment.PGPASSWORD);
    }
  });

  it("inherits exact DB component validation and URL rejection without leaking secrets", () => {
    for (const key of Object.keys(environment)) {
      expect(() => readApiConfig({ ...environment, [key]: undefined })).toThrow(
        "Invalid database configuration",
      );
    }
    for (const replacement of [
      { DB_TARGET: "production" },
      { PGHOST: "postgres" },
      { PGDATABASE: "storage_minis_dev" },
      { PGPORT: "5434" },
      { PGPORT: "05432" },
      { PGUSER: "other" },
      { PGPASSWORD: "  " },
      { PGHOST: "private-sentinel" },
    ]) {
      expect(() => readApiConfig({ ...environment, ...replacement })).toThrow(
        "Invalid database configuration. Check the explicit local target and connection components.",
      );
    }
    for (const DATABASE_URL of ["", "postgres://private-sentinel"]) {
      expect(() => readApiConfig({ ...environment, DATABASE_URL })).toThrow(
        "DATABASE_URL is not supported. Use the explicit local database target.",
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
