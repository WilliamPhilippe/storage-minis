import { defineConfig } from "drizzle-kit";
import generation from "./drizzle.config.js";
import { readDatabaseConfig } from "./src/config.js";
import { migrationHistory } from "./src/migrations.js";

const config = readDatabaseConfig(process.env);

export default defineConfig({
  ...generation,
  dialect: "postgresql",
  dbCredentials: {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: false,
  },
  migrations: migrationHistory,
});
