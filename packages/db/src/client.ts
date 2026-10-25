import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import type { Client, PoolClient } from "pg";
import { validateDatabaseConfig } from "./config.js";
import type { DatabaseConfig } from "./config.js";
import * as schema from "./schema/index.js";

export const databaseLimits = {
  connections: 5,
  idleMs: 10_000,
  connectMs: 2_000,
  statementMs: 3_000,
  queryMs: 4_000,
  checkMs: 6_000,
  closeMs: 10_000,
} as const;

export function createDatabase(input: DatabaseConfig) {
  const config = validateDatabaseConfig(input);
  const pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: false,
    options: "",
    application_name: "storage-minis",
    max: databaseLimits.connections,
    idleTimeoutMillis: databaseLimits.idleMs,
    connectionTimeoutMillis: databaseLimits.connectMs,
    statement_timeout: databaseLimits.statementMs,
    query_timeout: databaseLimits.queryMs,
  });
  const db = drizzle({ client: pool, schema });
  let closing: Promise<void> | undefined;
  let ready = false;
  const clients = new Set<Client>();
  pool.on("connect", (client: Client) => {
    clients.add(client);
  });
  pool.on("remove", (client: Client) => {
    clients.delete(client);
  });
  pool.on("error", () => {
    // pg removes the failed idle client; subsequent checks can establish recovery.
    ready = false;
  });

  async function check(): Promise<void> {
    if (closing) throw new Error("Database is closing.");
    let client: PoolClient | undefined;
    let released = false;
    let expired = false;
    const onClientError = () => {
      ready = false;
    };
    const release = (destroy: boolean) => {
      if (client && !released) {
        released = true;
        client.release(destroy);
        client.removeListener("error", onClientError);
      }
    };
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        (async () => {
          client = await pool.connect();
          // The pool's idle error listener is removed while a client is checked out.
          client.on("error", onClientError);
          if (expired) {
            release(true);
            throw new Error("Database check timed out.");
          }
          const result = await client.query<{ valid: boolean }>(
            "SELECT current_database() = $1 AND current_user = $2 AND current_setting('TimeZone') = 'UTC' AS valid",
            [config.database, config.user],
          );
          if (expired || closing || result.rows[0]?.valid !== true)
            throw new Error("Database identity mismatch.");
          ready = true;
        })(),
        new Promise<never>((_resolve, reject) => {
          timer = setTimeout(() => {
            expired = true;
            release(true);
            reject(new Error("Database check timed out."));
          }, databaseLimits.checkMs);
        }),
      ]);
    } catch (error) {
      ready = false;
      release(true);
      throw new Error(
        "Database check failed. Verify target, credentials and availability.",
        { cause: error },
      );
    } finally {
      clearTimeout(timer);
      release(false);
    }
  }

  function close(): Promise<void> {
    closing ??= new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        // End sockets even when a caller failed to finish a checked-out transaction.
        // Commands also enforce a process deadline and redact logged diagnostics.
        for (const client of clients) void client.end().catch(() => {});
        reject(
          new Error(
            "Database shutdown timed out. Release all owned transactions and clients.",
          ),
        );
      }, databaseLimits.closeMs);
      pool.end().then(
        () => {
          clearTimeout(timer);
          resolve();
        },
        (error: unknown) => {
          clearTimeout(timer);
          reject(
            new Error("Database shutdown failed.", {
              cause: error,
            }),
          );
        },
      );
    });
    return closing;
  }

  return {
    db,
    check,
    close,
    get healthy() {
      return !closing && ready;
    },
  };
}

export type Database = ReturnType<typeof createDatabase>;
