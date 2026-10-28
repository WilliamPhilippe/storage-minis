import { readDatabaseConfig } from "@storage-minis/db";
import type { DatabaseConfig } from "@storage-minis/db";
import { z } from "zod";

const httpSchema = z.object({
  HOST: z.enum(["127.0.0.1", "0.0.0.0"]).default("127.0.0.1"),
  PORT: z
    .string()
    .regex(/^[1-9][0-9]{0,4}$/)
    .refine((value) => Number(value) <= 65535)
    .default("3000")
    .transform(Number),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export interface ApiConfig {
  http: {
    host: "127.0.0.1" | "0.0.0.0";
    port: number;
    logLevel: z.infer<typeof httpSchema>["LOG_LEVEL"];
    nodeEnv: z.infer<typeof httpSchema>["NODE_ENV"];
  };
  database: DatabaseConfig;
}

export function readApiConfig(
  environment: Readonly<Record<string, string | undefined>>,
): ApiConfig {
  const result = httpSchema.safeParse({
    HOST: environment.HOST,
    PORT: environment.PORT,
    LOG_LEVEL: environment.LOG_LEVEL,
    NODE_ENV: environment.NODE_ENV,
  });
  if (!result.success) {
    // Only our known field names cross this boundary, never Zod issues/values.
    const fields = ["HOST", "PORT", "LOG_LEVEL", "NODE_ENV"].filter((field) =>
      result.error.issues.some((issue) => issue.path[0] === field),
    );
    throw new Error(`Invalid API configuration. Check ${fields.join(", ")}.`);
  }
  return {
    http: {
      host: result.data.HOST,
      port: result.data.PORT,
      logLevel: result.data.LOG_LEVEL,
      nodeEnv: result.data.NODE_ENV,
    },
    database: readDatabaseConfig(environment),
  };
}
