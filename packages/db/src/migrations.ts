import { readMigrationFiles } from "drizzle-orm/migrator";

export const migrationHistory = {
  schema: "drizzle",
  table: "__drizzle_migrations",
} as const;

export const migrationLimits = {
  processMs: 120_000,
  lockMs: 5_000,
  statementMs: 30_000,
} as const;

// The physical schema was approved by the owner on 2026-10-25 (S01–S10).
// Drizzle owns the journal format and migration loading. Refuse missing/empty
// artifacts before connecting instead of silently treating them as an empty DB.
export function requireMigrationArtifacts(folder: string): void {
  try {
    const migrations = readMigrationFiles({ migrationsFolder: folder });
    if (
      migrations.length === 0 ||
      migrations.some((migration) =>
        migration.sql.every((statement) => statement.trim().length === 0),
      )
    ) {
      throw new Error("Empty migration chain.");
    }
  } catch (error) {
    throw new Error(
      "Migration artifacts are missing or invalid. Restore the reviewed SQL and Drizzle journal before applying.",
      { cause: error },
    );
  }
}
