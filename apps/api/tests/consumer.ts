// Strict NodeNext consumer of compiled DB/schema declarations, without a pool.
import { schema } from "@storage-minis/db";
import type { Database } from "@storage-minis/db";

type Organization = typeof schema.organizations.$inferSelect;

export function readOrganizations(database: Database): Promise<Organization[]> {
  return database.db.select().from(schema.organizations);
}
