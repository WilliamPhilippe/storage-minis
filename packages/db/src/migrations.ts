import { readMigrationFiles } from "drizzle-orm/migrator";

export const migrationHistory = {
  schema: "drizzle",
  table: "__drizzle_migrations",
} as const;

// Set on the migration connection itself (startup parameters), so the native
// migrator's statements are bounded without a wrapping process supervisor.
export const migrationLimits = {
  connectMs: 2_000,
  lockMs: 5_000,
  statementMs: 30_000,
} as const;

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
