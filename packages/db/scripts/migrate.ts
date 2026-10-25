import { requireApprovedSchema } from "../src/migrations.js";

try {
  requireApprovedSchema();
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Migration application refused.",
  );
  process.exitCode = 1;
}
