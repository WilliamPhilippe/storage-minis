import { fileURLToPath } from "node:url";
import { defineConfig } from "drizzle-kit";
import { requireApprovedSchema } from "./src/migrations.js";

requireApprovedSchema();

export default defineConfig({
  dialect: "postgresql",
  schema: fileURLToPath(new URL("./src/schema/index.ts", import.meta.url)),
  out: fileURLToPath(new URL("./drizzle", import.meta.url)),
});
