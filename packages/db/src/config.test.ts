import { describe, expect, it } from "vitest";
import {
  parseDatabaseUrl,
  readDatabaseConfig,
  requireTestDatabase,
  validateDatabaseConfig,
} from "./config.js";

const url =
  "postgres://storage_minis_app:fixture-only-password@127.0.0.1:5434/storage_minis_test";
const expected =
  "Invalid DATABASE_URL. Expected postgres://USER:PASSWORD@HOST:PORT/DATABASE with optional ?sslmode=disable|verify-full.";

describe("database URL configuration", () => {
  it("reads explicit URL components, defaulting sslmode to disable", () => {
    expect(readDatabaseConfig({ DATABASE_URL: url, UNRELATED: "x" })).toEqual({
      host: "127.0.0.1",
      port: 5434,
      database: "storage_minis_test",
      user: "storage_minis_app",
      password: "fixture-only-password",
      sslmode: "disable",
    });
    expect(
      readDatabaseConfig(
        { MIGRATION_DATABASE_URL: url.replace("_app:", "_owner:") },
        "MIGRATION_DATABASE_URL",
      ).user,
    ).toBe("storage_minis_owner");
    expect(parseDatabaseUrl(`${url}?sslmode=verify-full`).sslmode).toBe(
      "verify-full",
    );
    expect(parseDatabaseUrl(`${url}?sslmode=disable`).sslmode).toBe("disable");
    expect(parseDatabaseUrl(url.replace("postgres:", "postgresql:")).port).toBe(
      5434,
    );
    expect(parseDatabaseUrl("postgres://u:p@[::1]:5432/db").host).toBe("::1");
  });

  it("decodes percent-encoded credentials and database names", () => {
    const password = "p@ss:/w'rd\\\n";
    expect(
      parseDatabaseUrl(
        `postgres://user%40x:${encodeURIComponent(password)}@db.internal:5432/name%2Dx`,
      ),
    ).toMatchObject({ user: "user@x", password, database: "name-x" });
  });

  it("requires the variable and names only the variable when it is missing", () => {
    expect(() => readDatabaseConfig({})).toThrow("DATABASE_URL is required.");
    expect(() => readDatabaseConfig({ DATABASE_URL: "  " })).toThrow(
      "DATABASE_URL is required.",
    );
    expect(() => readDatabaseConfig({}, "MIGRATION_DATABASE_URL")).toThrow(
      "MIGRATION_DATABASE_URL is required.",
    );
  });

  it("rejects every implicit, ambiguous or malformed URL without echoing it", () => {
    for (const value of [
      "not a url sentinel-secret",
      "mysql://u:sentinel-secret@host:5432/db",
      "http://u:sentinel-secret@host:5432/db",
      "postgres://u:sentinel-secret@host/db",
      "postgres://u:sentinel-secret@host:5432",
      "postgres://u:sentinel-secret@host:5432/",
      "postgres://u:sentinel-secret@host:5432/a/b",
      "postgres://u@host:5432/db?sentinel-secret",
      "postgres://:sentinel-secret@host:5432/db",
      "postgres://u:%20%20@host:5432/db?x=sentinel-secret",
      "postgres://u:sentinel-secret@:5432/db",
      "postgres://u:sentinel-secret@host:70000/db",
      "postgres://u:sentinel-secret@host:5432/db?sslmode=require",
      "postgres://u:sentinel-secret@host:5432/db?sslmode=verify-ca",
      "postgres://u:sentinel-secret@host:5432/db?sslmode=prefer",
      "postgres://u:sentinel-secret@host:5432/db?sslmode=disable&sslmode=verify-full",
      "postgres://u:sentinel-secret@host:5432/db?options=-c%20search_path%3Dx",
      "postgres://u:sentinel-secret@host:5432/db?host=/tmp",
      "postgres://u:sentinel-secret@host:5432/db#fragment",
      "postgres://u:%E0%A4%A@host:5432/db?sentinel-secret",
    ]) {
      let failure: unknown;
      try {
        parseDatabaseUrl(value);
      } catch (error) {
        failure = error;
      }
      expect(failure, value).toBeInstanceOf(Error);
      expect(String(failure)).toBe(`Error: ${expected}`);
      expect(failure).not.toHaveProperty("cause");
    }
    expect(() =>
      readDatabaseConfig(
        { MIGRATION_DATABASE_URL: "mysql://x" },
        "MIGRATION_DATABASE_URL",
      ),
    ).toThrow("Invalid MIGRATION_DATABASE_URL.");
  });

  it("validates explicit configuration objects without leaking values", () => {
    const config = parseDatabaseUrl(url);
    expect(validateDatabaseConfig(config)).toEqual(config);
    for (const replacement of [
      { password: "   " },
      { port: 0 },
      { host: "" },
      { sslmode: "require" },
      { extra: "sensitive-fixture" },
    ]) {
      let failure: unknown;
      try {
        validateDatabaseConfig({ ...config, ...replacement });
      } catch (error) {
        failure = error;
      }
      expect(String(failure)).toContain("Invalid database configuration.");
      expect(String(failure)).not.toContain("sensitive-fixture");
      expect(String(failure)).not.toContain(config.password);
    }
  });

  it("allows integration tests only on databases named *_test", () => {
    requireTestDatabase(parseDatabaseUrl(url));
    for (const name of [
      "storage_minis_dev",
      "storage_minis",
      "storage_minis_test_copy",
      "test",
    ]) {
      expect(() =>
        requireTestDatabase(
          parseDatabaseUrl(url.replace("storage_minis_test", name)),
        ),
      ).toThrow(
        "Database integration tests require a database whose name ends in _test.",
      );
    }
  });
});
