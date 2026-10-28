import { expect, it } from "vitest";
import { formatDatabaseError, redactDatabaseMessage } from "./diagnostics.js";

it("retains nested database messages and error codes without dumping error properties", () => {
  const cause = Object.assign(
    new Error("canceling statement due to lock timeout"),
    {
      code: "55P03",
      connection: { password: "should-not-be-serialized" },
    },
  );
  const error = new Error("Failed query: SELECT * FROM migration_history", {
    cause,
  });
  expect(formatDatabaseError(error)).toBe(
    "Failed query: SELECT * FROM migration_history\nCaused by: canceling statement due to lock timeout (55P03)",
  );
});

it("redacts literal/encoded passwords and credentials in PostgreSQL URLs", () => {
  const password = "fixture:p@ss/word";
  const result = redactDatabaseMessage(
    `authentication failed: ${password}; encoded=${encodeURIComponent(password)}; postgres://another:secret@localhost/db; postgresql://other:password@postgres/db`,
    password,
  );
  expect(result).toBe(
    "authentication failed: [REDACTED]; encoded=[REDACTED]; postgres://[REDACTED]@localhost/db; postgresql://[REDACTED]@postgres/db",
  );
});

it("formats non-Error throws and terminates cyclic cause chains", () => {
  expect(formatDatabaseError("missing SQL file")).toBe("missing SQL file");
  const error = new Error("failure");
  error.cause = error;
  expect(formatDatabaseError(error)).toBe("failure");
});
