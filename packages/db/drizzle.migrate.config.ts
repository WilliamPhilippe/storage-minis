import { defineConfig } from "drizzle-kit";
import generation from "./drizzle.config.js";
import { requireApprovedSchema } from "./src/migrations.js";

// Guard direct CLI invocations too; never read credentials while approval is pending.
requireApprovedSchema();

export default defineConfig({
  ...generation,
  migrations: { schema: "drizzle", table: "__drizzle_migrations" },
});
