import { fileURLToPath } from "node:url";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: fileURLToPath(new URL("./src/schema/index.ts", import.meta.url)),
  // Kit 0.31.11 prepends './' when reopening snapshots. Absolute output paths
  // work only on the first generation; the command wrapper fixes cwd here.
  out: "./drizzle",
});
