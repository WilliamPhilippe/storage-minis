import {
  organizationNicknameRule as nickname,
  readDatabaseConfig,
  schema,
} from "@storage-minis/db";
import type { DatabaseConfig } from "@storage-minis/db";
import { z } from "zod";
import type { BootstrapSettings } from "./auth/types.js";
import { ConfigurationError } from "./error-log.js";

const settingsSchema = z.object({
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
  // Fail closed: only an explicit development value logs error messages.
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  // AU-01: the project whose ID tokens the API accepts. Google Cloud project
  // IDs are 6–30 lowercase letters, digits and hyphens, starting with a letter
  // and not ending with a hyphen.
  FIREBASE_PROJECT_ID: z.string().regex(/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/),
  // AU-11: test custom tokens; only `.env.test` sets it (refused below with
  // NODE_ENV production or unset).
  AUTH_TEST_SIGN_IN: z.literal("enabled").optional(),
  // AU-07: all three or none; the currency defaults to BRL. An empty value is
  // invalid, as for every other setting.
  BOOTSTRAP_OWNER_EMAIL: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email())
    .optional(),
  BOOTSTRAP_ORGANIZATION_NAME: z.string().trim().min(1).max(100).optional(),
  // SI-04's provisional rule, shared with the database's check constraint.
  BOOTSTRAP_ORGANIZATION_NICKNAME: z
    .string()
    .min(nickname.minLength)
    .max(nickname.maxLength)
    .regex(nickname.pattern)
    .optional(),
  BOOTSTRAP_ORGANIZATION_CURRENCY: z
    .enum(schema.organizationCurrency.enumValues)
    .optional(),
});

type Settings = z.infer<typeof settingsSchema>;
const fields = Object.keys(settingsSchema.shape) as (keyof Settings)[];

export interface AuthConfig {
  /** The Firebase project whose ID tokens the API accepts (AU-01). */
  projectId: string;
  /** AU-11: also accept `custom` sign-ins of `e2e-` uids (test runs only). */
  acceptCustomTokens: boolean;
  /** AU-07; null when the environment configures no bootstrap. */
  bootstrap: BootstrapSettings | null;
}

export interface ApiConfig {
  http: {
    host: "127.0.0.1" | "0.0.0.0";
    port: number;
    logLevel: Settings["LOG_LEVEL"];
    nodeEnv: Settings["NODE_ENV"];
  };
  database: DatabaseConfig;
  auth: AuthConfig;
}

function bootstrapSettings(settings: Settings): BootstrapSettings | null {
  const {
    BOOTSTRAP_OWNER_EMAIL: ownerEmail,
    BOOTSTRAP_ORGANIZATION_NAME: name,
    BOOTSTRAP_ORGANIZATION_NICKNAME: nickname,
    BOOTSTRAP_ORGANIZATION_CURRENCY: currency,
  } = settings;
  if (
    ownerEmail === undefined &&
    name === undefined &&
    nickname === undefined &&
    currency === undefined
  ) {
    return null;
  }
  if (
    ownerEmail === undefined ||
    name === undefined ||
    nickname === undefined
  ) {
    throw new ConfigurationError(
      "Invalid API configuration. Set BOOTSTRAP_OWNER_EMAIL, BOOTSTRAP_ORGANIZATION_NAME and BOOTSTRAP_ORGANIZATION_NICKNAME together, or none of them.",
    );
  }
  return {
    ownerEmail,
    organization: { name, nickname, currency: currency ?? "BRL" },
  };
}

export function readApiConfig(
  environment: Readonly<Record<string, string | undefined>>,
): ApiConfig {
  const result = settingsSchema.safeParse(
    Object.fromEntries(fields.map((field) => [field, environment[field]])),
  );
  if (!result.success) {
    // Only our known field names cross this boundary, never Zod issues/values.
    const failed = fields.filter((field) =>
      result.error.issues.some((issue) => issue.path[0] === field),
    );
    throw new ConfigurationError(
      `Invalid API configuration. Check ${failed.join(", ")}.`,
    );
  }
  const settings = result.data;
  // AU-11's second lock: the API's default NODE_ENV is production, so an
  // unset value is refused too.
  if (
    settings.AUTH_TEST_SIGN_IN === "enabled" &&
    settings.NODE_ENV === "production"
  ) {
    throw new ConfigurationError(
      "Invalid API configuration. AUTH_TEST_SIGN_IN requires NODE_ENV development or test.",
    );
  }
  const bootstrap = bootstrapSettings(settings);
  let database: DatabaseConfig;
  try {
    database = readDatabaseConfig(environment);
  } catch (error) {
    // The DB package's URL failures are fixed text naming only the variable
    // (its config tests prove no value appears); keep it, drop any cause.
    throw new ConfigurationError(
      error instanceof Error ? error.message : "Invalid DATABASE_URL.",
    );
  }
  return {
    http: {
      host: settings.HOST,
      port: settings.PORT,
      logLevel: settings.LOG_LEVEL,
      nodeEnv: settings.NODE_ENV,
    },
    database,
    auth: {
      projectId: settings.FIREBASE_PROJECT_ID,
      acceptCustomTokens: settings.AUTH_TEST_SIGN_IN === "enabled",
      bootstrap,
    },
  };
}
