import { once } from "node:events";
import { sql } from "drizzle-orm";
import { runDatabaseCommand } from "../../scripts/command.js";

await runDatabaseCommand(async (database) => {
  await database.check();
  const acquired = once(database.db.$client, "acquire");
  const pending = Promise.resolve(
    database.db.execute(sql`SELECT pg_sleep(10)`),
  );
  await acquired;
  console.log("active");
  await pending;
});
