import { z } from "zod";

const common = {
  port: z.literal(5432),
  user: z.literal("postgres"),
  password: z.string().refine((value) => value.trim().length > 0),
};

const databaseConfig = z.discriminatedUnion("target", [
  z.strictObject({
    ...common,
    target: z.literal("dev"),
    host: z.literal("postgres"),
    database: z.literal("storage_minis_dev"),
  }),
  z.strictObject({
    ...common,
    target: z.literal("test"),
    host: z.literal("postgres_test"),
    database: z.literal("storage_minis_test"),
  }),
]);

export type DatabaseConfig = z.infer<typeof databaseConfig>;

export function validateDatabaseConfig(value: unknown): DatabaseConfig {
  const result = databaseConfig.safeParse(value);
  if (!result.success) {
    // Zod issues may contain supplied values. Never expose them at this boundary.
    throw new Error(
      "Invalid database configuration. Check the explicit local target and connection components.",
    );
  }
  return result.data;
}

export function readDatabaseConfig(
  environment: Readonly<Record<string, string | undefined>>,
): DatabaseConfig {
  if (environment.DATABASE_URL !== undefined) {
    throw new Error(
      "DATABASE_URL is not supported. Use the explicit local database target.",
    );
  }
  return validateDatabaseConfig({
    target: environment.DB_TARGET,
    host: environment.PGHOST,
    port: environment.PGPORT === "5432" ? 5432 : undefined,
    database: environment.PGDATABASE,
    user: environment.PGUSER,
    password: environment.PGPASSWORD,
  });
}

export function requireTestDatabase(config: DatabaseConfig): void {
  if (config.target !== "test") {
    throw new Error(
      "Database integration tests require the explicit test target.",
    );
  }
}
