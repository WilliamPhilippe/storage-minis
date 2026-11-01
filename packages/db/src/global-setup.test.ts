import { Socket } from "node:net";
import { afterEach, expect, it, vi } from "vitest";
import setup from "../tests/global-setup.js";

// The integration global setup must refuse before it opens any connection.
afterEach(() => {
  vi.unstubAllEnvs();
});

function stubUrls(app: string, migration: string) {
  vi.stubEnv(
    "DATABASE_URL",
    `postgres://storage_minis_app:fixture@127.0.0.1:1/${app}`,
  );
  vi.stubEnv(
    "MIGRATION_DATABASE_URL",
    `postgres://storage_minis_owner:fixture@127.0.0.1:1/${migration}`,
  );
}

it.each([
  ["development app", "storage_minis_dev", "storage_minis_test"],
  ["development owner", "storage_minis_test", "storage_minis_dev"],
  ["production", "storage_minis", "storage_minis"],
])(
  "refuses a %s database before any connection",
  async (_label, app, migration) => {
    stubUrls(app, migration);
    const connect = vi.spyOn(Socket.prototype, "connect");
    await expect(setup()).rejects.toThrow(
      "Database integration tests require a database whose name ends in _test.",
    );
    expect(connect).not.toHaveBeenCalled();
  },
);

it("refuses two different test databases before any connection", async () => {
  stubUrls("storage_minis_test", "other_test");
  const connect = vi.spyOn(Socket.prototype, "connect");
  await expect(setup()).rejects.toThrow(
    "DATABASE_URL and MIGRATION_DATABASE_URL must name the same test database.",
  );
  expect(connect).not.toHaveBeenCalled();
});
