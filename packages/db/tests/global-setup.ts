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

function identifier(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

/**
 * Vitest 5.0.5 crashes (`code.charCodeAt is not a function`, inside Vite
 * 8.3.5's module-runner source maps) while printing the stack frames of any
 * error thrown by a global setup, which hides the real message. Rethrow the
 * message and its causes with a frameless stack so the reason stays readable.
 */
function printable(error: unknown): Error {
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

async function prepareTestDatabase(): Promise<void> {
  const app = readDatabaseConfig(process.env, "DATABASE_URL");
  const owner = readDatabaseConfig(process.env, "MIGRATION_DATABASE_URL");
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
  await run(process.execPath, ["dist/migrate.js"], {
    cwd: packageRoot,
    env: process.env,
    timeout: 60_000,
  });
}

/**
 * Runs once before the integration files (approved 2026-10-31, plan group 2).
 * The guard comes first and refuses, before any connection, unless both URLs
 * name the same disposable `*_test` database. As the owner role it then
 * resets only that database's schemas and applies the committed chain with
 * the real migrate entry. The tests connect as the app role, so they exercise
 * its grants.
 */
export default async function setup(): Promise<void> {
  try {
    await prepareTestDatabase();
  } catch (error) {
    throw printable(error);
  }
}
