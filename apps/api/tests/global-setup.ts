import {
  prepareTestDatabase,
  printableSetupError,
} from "@storage-minis/db/testing";

/**
 * Runs once before the API's integration files (sign-in plan SI-16): the
 * shared `@storage-minis/db/testing` preparation refuses unless both URLs
 * name the same disposable `*_test` database, then resets it and applies the
 * committed chain as the owner role. The auth suite needs the tables; the
 * process suite checks that it changes none of them.
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
