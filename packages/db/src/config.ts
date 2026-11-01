import { z } from "zod";

/** The environment variables that may carry a database URL. */
export type DatabaseUrlVariable = "DATABASE_URL" | "MIGRATION_DATABASE_URL";

// TLS modes whose libpq semantics the pinned pg 8.23.1 driver implements
// exactly. It treats `require` and `verify-ca` as `verify-full` (with a
// warning), so those are rejected rather than silently strengthened.
const sslModes = ["disable", "verify-full"] as const;

const databaseConfig = z.strictObject({
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  database: z.string().min(1),
  user: z.string().min(1),
  password: z.string().refine((value) => value.trim().length > 0),
  sslmode: z.enum(sslModes),
});

export type DatabaseConfig = z.infer<typeof databaseConfig>;

export function validateDatabaseConfig(value: unknown): DatabaseConfig {
  const result = databaseConfig.safeParse(value);
  if (!result.success) {
    // Zod issues may contain supplied values. Never expose them at this boundary.
    throw new Error(
      "Invalid database configuration. Check host, port, database, user, password and sslmode.",
    );
  }
  return result.data;
}

function invalidUrl(variable: DatabaseUrlVariable): Error {
  // Name the variable and the expected shape only; never echo the value.
  return new Error(
    `Invalid ${variable}. Expected postgres://USER:PASSWORD@HOST:PORT/DATABASE with optional ?sslmode=disable|verify-full.`,
  );
}

function decode(value: string): string | undefined {
  try {
    return decodeURIComponent(value);
  } catch {
    return undefined;
  }
}

/**
 * Parses a standard PostgreSQL URL. Every connection component must be
 * explicit, so the driver never falls back to ambient PGHOST/PGUSER/
 * PGPASSWORD/PGPORT/PGSSLMODE values. Only the `sslmode` parameter is allowed.
 */
export function parseDatabaseUrl(
  value: string,
  variable: DatabaseUrlVariable = "DATABASE_URL",
): DatabaseConfig {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw invalidUrl(variable);
  }
  const path = /^\/([^/]+)$/.exec(url.pathname);
  const host = url.hostname.replace(/^\[(.*)\]$/, "$1");
  const parameters = [...url.searchParams.keys()];
  const sslmode = url.searchParams.get("sslmode") ?? "disable";
  if (
    (url.protocol !== "postgres:" && url.protocol !== "postgresql:") ||
    url.hash !== "" ||
    path === null ||
    url.port === "" ||
    parameters.some((name) => name !== "sslmode") ||
    parameters.length > 1
  ) {
    throw invalidUrl(variable);
  }
  const result = databaseConfig.safeParse({
    host,
    port: Number(url.port),
    database: decode(path[1] ?? ""),
    user: decode(url.username),
    password: decode(url.password),
    sslmode,
  });
  if (!result.success) throw invalidUrl(variable);
  return result.data;
}

export function readDatabaseConfig(
  environment: Readonly<Record<string, string | undefined>>,
  variable: DatabaseUrlVariable = "DATABASE_URL",
): DatabaseConfig {
  const value = environment[variable];
  if (value === undefined || value.trim() === "") {
    throw new Error(`${variable} is required.`);
  }
  return parseDatabaseUrl(value, variable);
}

/** Integration tests own only disposable databases named `*_test`. */
export function requireTestDatabase(config: DatabaseConfig): void {
  if (!config.database.endsWith("_test")) {
    throw new Error(
      "Database integration tests require a database whose name ends in _test.",
    );
  }
}
