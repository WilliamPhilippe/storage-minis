import { Server, Socket } from "node:net";
import { describe, expect, it, vi } from "vitest";
import { readApiConfig } from "./config.js";
import { ConfigurationError } from "./error-log.js";

const password = "fixture-secret-@:$'\\\n";
const projectId = "storage-minis-dev";
const environment = {
  DATABASE_URL: `postgres://storage_minis_app:${encodeURIComponent(password)}@127.0.0.1:5434/storage_minis_test`,
  FIREBASE_PROJECT_ID: projectId,
};
const bootstrap = {
  BOOTSTRAP_OWNER_EMAIL: "owner@example.com",
  BOOTSTRAP_ORGANIZATION_NAME: "Garage",
  BOOTSTRAP_ORGANIZATION_NICKNAME: "garage",
};

describe("API configuration", () => {
  it("defaults only absent HTTP values and ignores unrelated environment keys", () => {
    expect(readApiConfig({ ...environment, UNRELATED: "ignored" })).toEqual({
      http: {
        host: "127.0.0.1",
        port: 3000,
        logLevel: "info",
        // Fail closed: only an explicit development value logs messages.
        nodeEnv: "production",
      },
      database: {
        host: "127.0.0.1",
        port: 5434,
        database: "storage_minis_test",
        user: "storage_minis_app",
        password,
        sslmode: "disable",
      },
      auth: { projectId, acceptCustomTokens: false, bootstrap: null },
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
              FIREBASE_PROJECT_ID: "storage-minis",
            }),
          ).toMatchObject({
            http: {
              host: "0.0.0.0",
              port: Number(PORT),
              logLevel: LOG_LEVEL,
              nodeEnv: NODE_ENV,
            },
            database: { host: "postgres", database: "storage_minis" },
            auth: { projectId: "storage-minis" },
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
      expect(error).toBeInstanceOf(ConfigurationError);
      expect(String(error)).toBe(
        "ConfigurationError: Invalid API configuration. Check HOST, PORT, LOG_LEVEL, NODE_ENV.",
      );
      expect(error).not.toHaveProperty("cause");
      expect(error).not.toHaveProperty("issues");
      expect(String(error)).not.toContain(sentinel);
      expect(String(error)).not.toContain(password);
    }
  });

  it("inherits DATABASE_URL validation as a cause-free ConfigurationError without leaking secrets", () => {
    expect(() => readApiConfig({ FIREBASE_PROJECT_ID: projectId })).toThrow(
      new ConfigurationError("DATABASE_URL is required."),
    );
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
        readApiConfig({ DATABASE_URL, FIREBASE_PROJECT_ID: projectId });
      } catch (error) {
        failure = error;
      }
      expect(failure).toBeInstanceOf(ConfigurationError);
      expect(failure).not.toHaveProperty("cause");
      expect(String(failure)).toBe(
        "ConfigurationError: Invalid DATABASE_URL. Expected postgres://USER:PASSWORD@HOST:PORT/DATABASE with optional ?sslmode=disable|verify-full.",
      );
    }
  });

  it("requires FIREBASE_PROJECT_ID in Google Cloud's project ID format", () => {
    expect(() =>
      readApiConfig({ ...environment, FIREBASE_PROJECT_ID: undefined }),
    ).toThrow(
      new ConfigurationError(
        "Invalid API configuration. Check FIREBASE_PROJECT_ID.",
      ),
    );
    for (const value of [
      "",
      " ",
      "abcde",
      `a${"b".repeat(30)}`,
      "1storage-minis",
      "-storage-minis",
      "storage-minis-",
      "Storage-Minis",
      "storage_minis",
      "storage minis",
      " storage-minis",
    ]) {
      expect(() =>
        readApiConfig({ ...environment, FIREBASE_PROJECT_ID: value }),
      ).toThrow("Invalid API configuration. Check FIREBASE_PROJECT_ID.");
    }
    for (const value of ["abcdef", "storage-minis", `a${"b".repeat(29)}`]) {
      expect(
        readApiConfig({ ...environment, FIREBASE_PROJECT_ID: value }).auth
          .projectId,
      ).toBe(value);
    }
  });

  it("accepts custom test tokens only for an explicit opt-in outside production", () => {
    for (const NODE_ENV of ["development", "test"]) {
      expect(
        readApiConfig({
          ...environment,
          NODE_ENV,
          AUTH_TEST_SIGN_IN: "enabled",
        }).auth.acceptCustomTokens,
      ).toBe(true);
      expect(
        readApiConfig({ ...environment, NODE_ENV }).auth.acceptCustomTokens,
      ).toBe(false);
    }
    for (const value of ["", " ", "true", "1", "Enabled", "disabled"]) {
      expect(() =>
        readApiConfig({
          ...environment,
          NODE_ENV: "test",
          AUTH_TEST_SIGN_IN: value,
        }),
      ).toThrow("Invalid API configuration. Check AUTH_TEST_SIGN_IN.");
    }
    // AU-11's second lock: production, or unset (the API's default).
    for (const NODE_ENV of ["production", undefined]) {
      expect(() =>
        readApiConfig({
          ...environment,
          NODE_ENV,
          AUTH_TEST_SIGN_IN: "enabled",
        }),
      ).toThrow(
        new ConfigurationError(
          "Invalid API configuration. AUTH_TEST_SIGN_IN requires NODE_ENV development or test.",
        ),
      );
    }
  });

  it("reads the bootstrap settings with BRL by default and normalizes the owner email", () => {
    expect(
      readApiConfig({ ...environment, ...bootstrap }).auth.bootstrap,
    ).toEqual({
      ownerEmail: "owner@example.com",
      organization: { name: "Garage", nickname: "garage", currency: "BRL" },
    });
    expect(
      readApiConfig({
        ...environment,
        BOOTSTRAP_OWNER_EMAIL: "  CTT.WilliamPhilippe@Gmail.COM \n",
        BOOTSTRAP_ORGANIZATION_NAME: "  wipminis  ",
        BOOTSTRAP_ORGANIZATION_NICKNAME: "wipminis",
        BOOTSTRAP_ORGANIZATION_CURRENCY: "USD",
      }).auth.bootstrap,
    ).toEqual({
      ownerEmail: "ctt.williamphilippe@gmail.com",
      organization: { name: "wipminis", nickname: "wipminis", currency: "USD" },
    });
  });

  it("requires the three bootstrap settings together or none of them", () => {
    const together =
      "Invalid API configuration. Set BOOTSTRAP_OWNER_EMAIL, BOOTSTRAP_ORGANIZATION_NAME and BOOTSTRAP_ORGANIZATION_NICKNAME together, or none of them.";
    for (const missing of Object.keys(bootstrap)) {
      const partial: Record<string, string> = { ...bootstrap };
      delete partial[missing];
      expect(() => readApiConfig({ ...environment, ...partial })).toThrow(
        new ConfigurationError(together),
      );
    }
    expect(() =>
      readApiConfig({ ...environment, BOOTSTRAP_ORGANIZATION_CURRENCY: "BRL" }),
    ).toThrow(new ConfigurationError(together));
  });

  it.each([
    [
      "BOOTSTRAP_OWNER_EMAIL",
      ["", " ", "owner", "owner@", "@example.com", "owner@@example.com"],
    ],
    ["BOOTSTRAP_ORGANIZATION_NAME", ["", "   ", "x".repeat(101)]],
    [
      "BOOTSTRAP_ORGANIZATION_NICKNAME",
      [
        "",
        "ab",
        "a".repeat(31),
        "Garage",
        "garage_1",
        "-garage",
        "garage-",
        "gar--age",
        "gar age",
        " garage",
        "garagé",
      ],
    ],
    ["BOOTSTRAP_ORGANIZATION_CURRENCY", ["", "brl", "EUR", " BRL"]],
  ])(
    "rejects invalid %s values with only a safe field name",
    (field, values) => {
      for (const value of values) {
        expect(() =>
          readApiConfig({ ...environment, ...bootstrap, [field]: value }),
        ).toThrow(
          new ConfigurationError(`Invalid API configuration. Check ${field}.`),
        );
      }
    },
  );

  it("accepts nicknames under SI-04's provisional rule", () => {
    for (const nickname of [
      "abc",
      "wipminis",
      "e2e-garage",
      "a-b-c",
      "garage-2026",
      "1st",
      "a".repeat(30),
    ]) {
      expect(
        readApiConfig({
          ...environment,
          ...bootstrap,
          BOOTSTRAP_ORGANIZATION_NICKNAME: nickname,
        }).auth.bootstrap?.organization.nickname,
      ).toBe(nickname);
    }
  });

  it("never includes auth or bootstrap values in failures", () => {
    const sentinel = "private-sentinel";
    try {
      readApiConfig({
        ...environment,
        FIREBASE_PROJECT_ID: `Bad ${sentinel}`,
        AUTH_TEST_SIGN_IN: sentinel,
        BOOTSTRAP_OWNER_EMAIL: sentinel,
        BOOTSTRAP_ORGANIZATION_NAME: `${sentinel}`.repeat(20),
        BOOTSTRAP_ORGANIZATION_NICKNAME: sentinel.toUpperCase(),
        BOOTSTRAP_ORGANIZATION_CURRENCY: sentinel,
      });
      expect.fail("expected validation failure");
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigurationError);
      expect(String(error)).toBe(
        "ConfigurationError: Invalid API configuration. Check FIREBASE_PROJECT_ID, AUTH_TEST_SIGN_IN, BOOTSTRAP_OWNER_EMAIL, BOOTSTRAP_ORGANIZATION_NAME, BOOTSTRAP_ORGANIZATION_NICKNAME, BOOTSTRAP_ORGANIZATION_CURRENCY.",
      );
      expect(error).not.toHaveProperty("cause");
      expect(String(error)).not.toContain(sentinel);
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
