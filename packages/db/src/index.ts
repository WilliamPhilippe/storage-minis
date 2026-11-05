export { createDatabase, databaseLimits } from "./client.js";
export type { Database } from "./client.js";
export {
  parseDatabaseUrl,
  readDatabaseConfig,
  requireTestDatabase,
  validateDatabaseConfig,
} from "./config.js";
export type { DatabaseConfig, DatabaseUrlVariable } from "./config.js";
export * as schema from "./schema/index.js";
export { organizationNicknameRule } from "./schema/identity-and-access.js";
// The Drizzle operators the API's queries use, re-exported so the workspace
// keeps one drizzle-orm instance and its types (owner-approved 2026-11-05).
export { and, asc, eq, sql } from "drizzle-orm";
