import {
  prepareTestDatabase,
  printableSetupError,
} from "../dist-testing/index.js";

/**
 * Runs once before the integration files (approved 2026-10-31, plan group 2):
 * the shared `@storage-minis/db/testing` preparation refuses unless both URLs
 * name the same disposable `*_test` database, then resets it and applies the
 * committed chain as the owner role.
 */
export default async function setup(): Promise<void> {
  try {
    await prepareTestDatabase({
      databaseUrl: process.env.DATABASE_URL,
      migrationDatabaseUrl: process.env.MIGRATION_DATABASE_URL,
    });
  } catch (error) {
    throw printableSetupError(error);
  }
}
