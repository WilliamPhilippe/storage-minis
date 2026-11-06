// `@storage-minis/db/testing`: shared test-database preparation (sign-in plan
// SI-16). It compiles to `dist-testing/`, outside the package's `files`, so
// `pnpm deploy --prod` leaves this schema-dropping helper out of the API
// image. Used by `test:db`'s and `test:api`'s Vitest global setups; PR 3b's
// Playwright setup passes the URLs it parses from `.env.test` (PW-06).
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import {
  createDatabase,
  readDatabaseConfig,
  requireTestDatabase,
} from "../dist/index.js";

const run = promisify(execFile);
const packageRoot = fileURLToPath(new URL("..", import.meta.url));

export interface TestDatabaseUrls {
  /** The app role's URL (`DATABASE_URL`), used by the tests. */
  databaseUrl: string | undefined;
  /** The owner role's URL (`MIGRATION_DATABASE_URL`), used to reset and migrate. */
  migrationDatabaseUrl: string | undefined;
}

function identifier(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

/**
 * Resets the disposable test database and applies the committed chain.
 *
 * The guard comes first and refuses, before any connection, unless both URLs
 * name the same `*_test` database. As the owner it then drops the `drizzle`
 * and `public` schemas, recreates `public`, restores the app role's schema
 * usage, and runs the real `dist/migrate.js`. Tests connect as the app role,
 * so they exercise its grants.
 */
export async function prepareTestDatabase(
  urls: TestDatabaseUrls,
): Promise<void> {
  const app = readDatabaseConfig(
    { DATABASE_URL: urls.databaseUrl },
    "DATABASE_URL",
  );
  const owner = readDatabaseConfig(
    { MIGRATION_DATABASE_URL: urls.migrationDatabaseUrl },
    "MIGRATION_DATABASE_URL",
  );
  requireTestDatabase(app);
  requireTestDatabase(owner);
  // Conservative: compares the written host, port and name literally, so a
  // mix such as localhost/127.0.0.1 is refused even when both reach one server.
  if (
    app.host !== owner.host ||
    app.port !== owner.port ||
    app.database !== owner.database
  ) {
    throw new Error(
      "DATABASE_URL and MIGRATION_DATABASE_URL must name the same test database.",
    );
  }
  const database = createDatabase(owner);
  try {
    await database.check();
    // Recreating public drops its grants; the init script's default
    // privileges are database-wide, so only schema usage needs restoring.
    await database.db.$client.query(
      `DROP SCHEMA IF EXISTS drizzle CASCADE; DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT USAGE ON SCHEMA public TO ${identifier(app.user)};`,
    );
  } finally {
    await database.close();
  }
  // The migrator reads only MIGRATION_DATABASE_URL; nothing else is inherited.
  await run(process.execPath, ["dist/migrate.js"], {
    cwd: packageRoot,
    env: { MIGRATION_DATABASE_URL: urls.migrationDatabaseUrl },
    timeout: 60_000,
  });
}

/**
 * Vitest 5.0.5 crashes (`code.charCodeAt is not a function`, inside Vite
 * 8.3.5's module-runner source maps) while printing the stack frames of any
 * error thrown by a global setup, which hides the real message. Global setups
 * rethrow through this: the message and its causes, with a frameless stack.
 */
export function printableSetupError(error: unknown): Error {
  const messages: string[] = [];
  for (
    let current: unknown = error;
    current !== undefined && messages.length < 5;
    current = current instanceof Error ? current.cause : undefined
  ) {
    messages.push(
      current instanceof Error
        ? current.message
        : typeof current === "string"
          ? current
          : "Unknown setup failure.",
    );
  }
  const failure = new Error(messages.join("\nCaused by: "));
  failure.stack = `Error: ${failure.message}`;
  return failure;
}
