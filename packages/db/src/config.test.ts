import { describe, expect, it } from "vitest";
import {
  readDatabaseConfig,
  requireTestDatabase,
  validateDatabaseConfig,
} from "./config.js";

const environment = {
  DB_TARGET: "test",
  PGHOST: "postgres_test",
  PGPORT: "5432",
  PGDATABASE: "storage_minis_test",
  PGUSER: "postgres",
  PGPASSWORD: "fixture-only-password",
};

describe("explicit local database targets", () => {
  it("accepts exact targets and rejects mixed development/test tuples", () => {
    expect(readDatabaseConfig(environment).target).toBe("test");
    expect(
      readDatabaseConfig({
        ...environment,
        DB_TARGET: "dev",
        PGHOST: "postgres",
        PGDATABASE: "storage_minis_dev",
      }).target,
    ).toBe("dev");
    for (const replacement of [
      { PGHOST: "postgres" },
      { PGDATABASE: "storage_minis_dev" },
      { PGHOST: "localhost" },
      { PGPORT: "5434" },
      { PGPORT: "05432" },
      { PGUSER: "another-role" },
      { DB_TARGET: "production" },
      { PGPASSWORD: "   " },
    ]) {
      expect(() =>
        readDatabaseConfig({ ...environment, ...replacement }),
      ).toThrow("Invalid database configuration");
    }
  });

  it("rejects missing components without leaking supplied values", () => {
    for (const key of Object.keys(environment)) {
      const incomplete: Record<string, string | undefined> = {
        ...environment,
        [key]: undefined,
      };
      expect(() => readDatabaseConfig(incomplete)).toThrow(
        "Invalid database configuration",
      );
    }
    try {
      validateDatabaseConfig({ ...environment, password: "sensitive-fixture" });
    } catch (error) {
      expect(String(error)).not.toContain("sensitive-fixture");
    }
    expect(() =>
      readDatabaseConfig({ ...environment, DATABASE_URL: "sensitive-fixture" }),
    ).toThrow("DATABASE_URL is not supported");
  });

  it("does not allow the integration suite to use development", () => {
    requireTestDatabase(readDatabaseConfig(environment));
    expect(() =>
      requireTestDatabase(
        readDatabaseConfig({
          ...environment,
          DB_TARGET: "dev",
          PGHOST: "postgres",
          PGDATABASE: "storage_minis_dev",
        }),
      ),
    ).toThrow("explicit test target");
  });
});
