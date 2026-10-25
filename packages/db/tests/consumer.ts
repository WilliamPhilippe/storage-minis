// Compile this as an ordinary NodeNext consumer of the built package exports.
import { createDatabase } from "@storage-minis/db";
import type { Database, DatabaseConfig } from "@storage-minis/db";

export function consume(config: DatabaseConfig): Database {
  return createDatabase(config);
}
