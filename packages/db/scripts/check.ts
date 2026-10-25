import { runDatabaseCommand } from "./command.js";

await runDatabaseCommand(async (database) => {
  await database.check();
  console.log("Database authentication and identity passed.");
});
