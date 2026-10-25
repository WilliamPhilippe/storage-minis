import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import { requireMigrationArtifacts } from "./migrations.js";
import { formatDatabaseError } from "./diagnostics.js";

it("accepts the reviewed migration chain without a live database", () => {
  expect(() =>
    requireMigrationArtifacts(
      fileURLToPath(new URL("../drizzle", import.meta.url)),
    ),
  ).not.toThrow();
});

it("refuses missing, empty and incomplete migration artifacts before connecting", () => {
  const directory = mkdtempSync(join(tmpdir(), "storage-minis-migrations-"));
  try {
    expect(() => requireMigrationArtifacts(directory)).toThrow(
      "Migration artifacts",
    );
    try {
      requireMigrationArtifacts(directory);
    } catch (error) {
      expect(formatDatabaseError(error)).toContain("_journal.json");
    }
    mkdirSync(join(directory, "meta"));
    const journal = join(directory, "meta/_journal.json");
    writeFileSync(journal, JSON.stringify({ entries: [] }));
    expect(() => requireMigrationArtifacts(directory)).toThrow(
      "Migration artifacts",
    );
    try {
      requireMigrationArtifacts(directory);
    } catch (error) {
      expect(formatDatabaseError(error)).toContain("Empty migration chain");
    }
    writeFileSync(
      journal,
      JSON.stringify({ entries: [{ tag: "0000_missing" }] }),
    );
    expect(() => requireMigrationArtifacts(directory)).toThrow(
      "Migration artifacts",
    );
    writeFileSync(join(directory, "0000_missing.sql"), "\n");
    expect(() => requireMigrationArtifacts(directory)).toThrow(
      "Migration artifacts",
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
