import { execFile, spawn } from "node:child_process";
import {
  cp,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { eq, is, sql } from "drizzle-orm";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { getTableConfig, PgTable } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import type { PoolClient } from "pg";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import {
  createDatabase,
  readDatabaseConfig,
  requireTestDatabase,
  schema,
} from "../dist/index.js";

const config = readDatabaseConfig(process.env);
requireTestDatabase(config);
const database = createDatabase(config);
const execute = promisify(execFile);
const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const migrationsFolder = join(packageRoot, "drizzle");
let client: PoolClient;

// This suite owns only the explicitly validated disposable test database.
async function freshSchema() {
  await database.db.execute(sql`DROP SCHEMA public CASCADE`);
  await database.db.execute(sql`CREATE SCHEMA public`);
  await database.db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
}

function applyCommand(environment: NodeJS.ProcessEnv = process.env) {
  return execute(process.execPath, ["--import", "tsx", "scripts/migrate.ts"], {
    cwd: packageRoot,
    env: environment,
    timeout: 15_000,
  });
}

beforeAll(async () => {
  await database.check();
  await freshSchema();
  await applyCommand();
});
afterAll(async () => {
  try {
    const tables = Object.values(schema).filter((value) => is(value, PgTable));
    await database.db.$client.query(
      `TRUNCATE ${tables.map((table) => identifier(getTableConfig(table).name)).join(", ")}`,
    );
  } finally {
    await database.close();
  }
});
beforeEach(async () => {
  client = await database.db.$client.connect();
  await client.query("BEGIN");
});
afterEach(async () => {
  await client.query("ROLLBACK");
  client.release();
});

function identifier(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

// SQL fixtures exercise structural constraints; they are not business writers.
async function insert(
  table: string,
  values: Record<string, unknown>,
  connection = client,
): Promise<number> {
  const entries = Object.entries(values);
  const result = await connection.query<{ id: number }>(
    `INSERT INTO ${identifier(table)} (${entries.map(([name]) => identifier(name)).join(", ")}) VALUES (${entries.map((_, index) => `$${index + 1}`).join(", ")}) RETURNING id`,
    entries.map(([, value]) => value),
  );
  const id = result.rows[0]?.id;
  if (id === undefined) throw new Error("Fixture insert returned no identity.");
  return id;
}

async function rejected(statement: string, values: unknown[], code: string) {
  await client.query("SAVEPOINT rejected_write");
  try {
    await expect(client.query(statement, values)).rejects.toMatchObject({
      code,
    });
  } finally {
    await client.query("ROLLBACK TO SAVEPOINT rejected_write");
    await client.query("RELEASE SAVEPOINT rejected_write");
  }
}

async function fixture(connection = client) {
  const organizationId = await insert(
    "organizations",
    { name: "Fixture" },
    connection,
  );
  const actorUserId = await insert(
    "users",
    { firebase_uid: `fixture-${organizationId}` },
    connection,
  );
  const event = (global: boolean) =>
    insert(
      "business_events",
      {
        scope: global ? "global_product" : "organization",
        organization_id: global ? null : organizationId,
        actor_user_id: actorUserId,
        action_type: "structural_fixture",
        occurred_at: "2026-11-01T01:00:00.123Z",
      },
      connection,
    );
  const globalEventId = await event(true);
  const eventId = await event(false);
  const productId = await insert(
    "products",
    {
      name: "Fixture miniature",
      sku: "nonunique",
      brand: "Fixture",
      registration_event_id: globalEventId,
    },
    connection,
  );
  const supplierId = await insert(
    "suppliers",
    {
      organization_id: organizationId,
      name: "Supplier",
      phone: "fixture",
      type: "person",
      created_event_id: eventId,
    },
    connection,
  );
  const purchaseId = await insert(
    "purchases",
    {
      organization_id: organizationId,
      supplier_id: supplierId,
      ordered_on: "2026-10-01T01:00:00Z",
      created_event_id: eventId,
    },
    connection,
  );
  const purchaseItemId = await insert(
    "purchase_items",
    {
      organization_id: organizationId,
      purchase_id: purchaseId,
      ordered_quantity: 2,
      merchandise_total: 0,
      created_event_id: eventId,
    },
    connection,
  );
  const unitValues = {
    organization_id: organizationId,
    product_id: productId,
    purchase_id: purchaseId,
    purchase_item_id: purchaseItemId,
    merchandise_cost: 0,
    status: "received",
    created_event_id: eventId,
  };
  const inventoryItemId = await insert(
    "inventory_items",
    unitValues,
    connection,
  );
  const secondItemId = await insert("inventory_items", unitValues, connection);
  const customerId = await insert(
    "customers",
    {
      organization_id: organizationId,
      name: "Customer",
      created_event_id: eventId,
    },
    connection,
  );
  const secondCustomerId = await insert(
    "customers",
    {
      organization_id: organizationId,
      name: "Another customer",
      created_event_id: eventId,
    },
    connection,
  );
  const saleValues = {
    organization_id: organizationId,
    customer_id: customerId,
    sold_on: "2026-10-31T22:00:00.123-03:00",
    created_event_id: eventId,
  };
  const saleId = await insert("sales", saleValues, connection);
  const secondSaleId = await insert("sales", saleValues, connection);
  return {
    organizationId,
    actorUserId,
    eventId,
    globalEventId,
    productId,
    supplierId,
    purchaseId,
    purchaseItemId,
    inventoryItemId,
    secondItemId,
    customerId,
    secondCustomerId,
    saleId,
    secondSaleId,
  };
}

it("replays all 33 tables/316 columns/11 enums with every declared constraint", async () => {
  const tables = Object.values(schema).filter((value) => is(value, PgTable));
  expect(tables).toHaveLength(33);
  const rows = await client.query<{
    table_name: string;
    column_name: string;
    is_nullable: string;
    data_type: string;
    is_identity: string;
    identity_generation: string | null;
    is_generated: string;
    datetime_precision: number | null;
    column_default: string | null;
  }>("SELECT * FROM information_schema.columns WHERE table_schema = 'public'");
  expect(rows.rows).toHaveLength(316);
  const constraints = await client.query<{ conname: string; contype: string }>(
    "SELECT conname, contype FROM pg_constraint WHERE connamespace = 'public'::regnamespace",
  );
  const names = new Set(constraints.rows.map((row) => row.conname));
  let foreignKeys = 0;
  for (const table of tables) {
    const definition = getTableConfig(table);
    const actual = rows.rows.filter(
      (row) => row.table_name === definition.name,
    );
    expect(actual).toHaveLength(definition.columns.length);
    for (const column of definition.columns) {
      const row = actual.find((row) => row.column_name === column.name);
      expect(row?.is_nullable).toBe(column.notNull ? "NO" : "YES");
      expect(row?.is_generated).toBe(column.generated ? "ALWAYS" : "NEVER");
      if (column.name === "id") {
        expect(row?.data_type).toBe("integer");
        expect(row?.identity_generation).toBe("ALWAYS");
      }
      if (column.getSQLType().includes("timestamp")) {
        expect(row?.datetime_precision).toBe(3);
        expect(row?.data_type).toBe("timestamp with time zone");
        expect(row?.column_default !== null).toBe(
          column.name === "recorded_at" || column.name === "created_at",
        );
      }
    }
    for (const key of definition.foreignKeys) {
      expect(names.has(key.getName())).toBe(true);
      foreignKeys += 1;
    }
    for (const check of definition.checks)
      expect(names.has(check.name)).toBe(true);
    for (const key of definition.uniqueConstraints)
      expect(names.has(key.getName() ?? "")).toBe(true);
  }
  expect(foreignKeys).toBe(157);
  expect(constraints.rows.filter((row) => row.contype === "f")).toHaveLength(
    157,
  );
  const enums = await client.query<{ typname: string; values: string[] }>(
    "SELECT typname, array_agg(enumlabel::text ORDER BY enumsortorder) AS values FROM pg_type JOIN pg_enum ON enumtypid = pg_type.oid WHERE typnamespace = 'public'::regnamespace GROUP BY typname",
  );
  expect(enums.rows).toHaveLength(11);
  for (const value of Object.values(schema)) {
    if (
      typeof value === "function" &&
      "enumName" in value &&
      "enumValues" in value
    ) {
      expect(
        enums.rows.find((row) => row.typname === value.enumName)?.values,
      ).toEqual(value.enumValues);
    }
  }
});

it("repeat CLI application changes neither migration history nor schema", async () => {
  const before = await client.query(
    "SELECT * FROM drizzle.__drizzle_migrations ORDER BY id",
  );
  expect(before.rowCount).toBe(readMigrationFiles({ migrationsFolder }).length);
  const output = await applyCommand();
  expect(output.stdout).toContain("already-applied migrations were skipped");
  expect(
    (
      await client.query(
        "SELECT * FROM drizzle.__drizzle_migrations ORDER BY id",
      )
    ).rows,
  ).toEqual(before.rows);
  expect(
    (
      await client.query(
        "SELECT count(*)::integer AS count FROM information_schema.tables WHERE table_schema = 'public'",
      )
    ).rows,
  ).toEqual([{ count: 33 }]);
});

it("a failed later statement rolls back the entire copied migration chain", async () => {
  const copy = await mkdtemp(
    join(tmpdir(), "storage-minis-invalid-migration-"),
  );
  // Replay the full copied chain in an isolated namespace, adding one invalid
  // statement at its end. Committed SQL/journal and public fixtures stay intact.
  const schemaName = "migration_rollback_fixture";
  const isolated = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: false,
    max: 1,
    options: `-c search_path=${schemaName}`,
    connectionTimeoutMillis: 2_000,
    statement_timeout: 3_000,
  });
  try {
    await database.db.execute(sql`CREATE SCHEMA migration_rollback_fixture`);
    await cp(migrationsFolder, copy, { recursive: true });
    const files = (await readdir(copy))
      .filter((file) => file.endsWith(".sql"))
      .sort();
    for (const file of files) {
      const copiedSql = (await readFile(join(copy, file), "utf8"))
        .replaceAll('"public".', '"migration_rollback_fixture".')
        .replaceAll("public.", "migration_rollback_fixture.");
      const suffix =
        file === files.at(-1)
          ? "\n--> statement-breakpoint\nSELECT storage_minis_intentional_failure();"
          : "";
      await writeFile(join(copy, file), `${copiedSql}${suffix}`);
    }
    await expect(
      migrate(drizzle(isolated), {
        migrationsFolder: copy,
        migrationsSchema: "migration_failure_history",
      }),
    ).rejects.toMatchObject({ cause: { code: "42883" } });
    expect(
      (
        await client.query(
          "SELECT count(*)::integer AS count FROM pg_class WHERE relnamespace = $1::regnamespace",
          [schemaName],
        )
      ).rows,
    ).toEqual([{ count: 0 }]);
    expect(
      (
        await client.query(
          "SELECT count(*)::integer AS count FROM pg_proc WHERE pronamespace = $1::regnamespace",
          [schemaName],
        )
      ).rows,
    ).toEqual([{ count: 0 }]);
    expect(
      (
        await database.db.$client.query(
          "SELECT count(*)::integer AS count FROM migration_failure_history.__drizzle_migrations",
        )
      ).rows,
    ).toEqual([{ count: 0 }]);
  } finally {
    await isolated.end();
    await database.db.execute(
      sql`DROP SCHEMA IF EXISTS migration_rollback_fixture CASCADE`,
    );
    await database.db.execute(
      sql`DROP SCHEMA IF EXISTS migration_failure_history CASCADE`,
    );
    await rm(copy, { recursive: true, force: true });
  }
});

it("uses generated base36 identities and retains them through soft removal", async () => {
  const f = await fixture();
  const converted = await client.query<{ encoded: string[] }>(
    "SELECT array_agg(public.inventory_id_base36(value) ORDER BY value) AS encoded FROM unnest(ARRAY[1,35,36,2147483647]) AS value",
  );
  expect(converted.rows[0]?.encoded).toEqual(["1", "Z", "10", "ZIK0ZJ"]);
  const before = await client.query<{ inventoryId: string }>(
    'SELECT "inventoryId" FROM inventory_items WHERE id = $1',
    [f.inventoryItemId],
  );
  expect(before.rows[0]?.inventoryId).toBe(
    f.inventoryItemId.toString(36).toUpperCase(),
  );
  await client.query(
    "UPDATE inventory_items SET removed_event_id = $1 WHERE id = $2",
    [f.eventId, f.inventoryItemId],
  );
  expect(
    (
      await client.query(
        'SELECT "inventoryId" FROM inventory_items WHERE id = $1',
        [f.inventoryItemId],
      )
    ).rows,
  ).toEqual(before.rows);
  await rejected(
    'UPDATE inventory_items SET "inventoryId" = $1 WHERE id = $2',
    ["changed", f.inventoryItemId],
    "428C9",
  );
  await rejected(
    "INSERT INTO organizations (id, name) VALUES (100, 'explicit identity')",
    [],
    "428C9",
  );
  await rejected(
    "INSERT INTO organizations (id, name) OVERRIDING SYSTEM VALUE VALUES (0, 'invalid')",
    [],
    "23514",
  );
});

it("enforces global identity, Membership uniqueness, defaults and nonblank Customer names", async () => {
  const f = await fixture();
  const user = await client.query(
    "SELECT can_edit_products, role FROM users WHERE id = $1",
    [f.actorUserId],
  );
  expect(user.rows).toEqual([{ can_edit_products: false, role: "user" }]);
  await rejected(
    "INSERT INTO users (firebase_uid) SELECT firebase_uid FROM users WHERE id = $1",
    [f.actorUserId],
    "23505",
  );
  await client.query(
    "INSERT INTO memberships (organization_id, user_id, granted_at, role) VALUES ($1, $2, now(), 'owner')",
    [f.organizationId, f.actorUserId],
  );
  await rejected(
    "INSERT INTO memberships (organization_id, user_id, granted_at, role) VALUES ($1, $2, now(), 'viewer')",
    [f.organizationId, f.actorUserId],
    "23505",
  );
  await rejected(
    "INSERT INTO customers (organization_id, name, created_event_id) VALUES ($1, '   ', $2)",
    [f.organizationId, f.eventId],
    "23514",
  );
  await rejected(
    "INSERT INTO customers (organization_id, name, created_event_id) VALUES ($1, $2, $3)",
    [f.organizationId, "\t\n", f.eventId],
    "23514",
  );
  await rejected(
    "INSERT INTO customers (organization_id, created_event_id) VALUES ($1, $2)",
    [f.organizationId, f.eventId],
    "23502",
  );
});

it("allows global Product reuse but rejects cross-Organization acquisition and event paths", async () => {
  const a = await fixture();
  const b = await fixture();
  await client.query(
    "UPDATE inventory_items SET product_id = $1 WHERE id = $2",
    [a.productId, b.inventoryItemId],
  );
  await rejected(
    "UPDATE inventory_items SET purchase_id = $1, purchase_item_id = $2 WHERE id = $3",
    [a.purchaseId, a.purchaseItemId, b.inventoryItemId],
    "23503",
  );
  await rejected(
    "UPDATE inventory_items SET created_event_id = $1 WHERE id = $2",
    [a.eventId, b.inventoryItemId],
    "23503",
  );
  await rejected(
    "UPDATE purchases SET supplier_id = $1 WHERE id = $2",
    [a.supplierId, b.purchaseId],
    "23503",
  );
  await rejected(
    "UPDATE purchases SET created_event_id = $1 WHERE id = $2",
    [b.globalEventId, b.purchaseId],
    "23503",
  );
  // A global Product never obtains Organization ownership via provenance.
  await rejected(
    "UPDATE products SET registration_event_id = $1 WHERE id = $2",
    [a.eventId, a.productId],
    "23503",
  );
});

it("rejects cross-Customer and cross-Supplier funding even inside one Organization", async () => {
  const f = await fixture();
  const line = await insert("sale_items", {
    organization_id: f.organizationId,
    sale_id: f.saleId,
    inventory_item_id: f.inventoryItemId,
    agreed_price: 0,
    recognized_acquisition_cost: 0,
    created_event_id: f.eventId,
  });
  const payment = await insert("customer_payments", {
    organization_id: f.organizationId,
    customer_id: f.customerId,
    amount: 100,
    paid_on: "2026-11-01T01:00:00Z",
    method: "fixture",
    created_event_id: f.eventId,
  });
  const allocation = await insert("customer_payment_allocations", {
    organization_id: f.organizationId,
    customer_id: f.customerId,
    customer_payment_id: payment,
    sale_id: f.saleId,
    sale_item_id: line,
    amount: 100,
    created_event_id: f.eventId,
  });
  await rejected(
    "UPDATE customer_payment_allocations SET customer_id = $1 WHERE id = $2",
    [f.secondCustomerId, allocation],
    "23503",
  );
  const otherSale = await insert("sales", {
    organization_id: f.organizationId,
    customer_id: f.secondCustomerId,
    sold_on: "2026-11-01T01:00:00Z",
    created_event_id: f.eventId,
  });
  await rejected(
    "UPDATE customer_payment_allocations SET sale_id = $1 WHERE id = $2",
    [otherSale, allocation],
    "23503",
  );
  await rejected(
    "UPDATE customer_payment_allocations SET sale_item_id = NULL WHERE id = $1",
    [allocation],
    "23502",
  );
  const otherSupplier = await insert("suppliers", {
    organization_id: f.organizationId,
    name: "Other",
    phone: "fixture",
    type: "business",
    created_event_id: f.eventId,
  });
  const supplierPayment = await insert("supplier_payments", {
    organization_id: f.organizationId,
    supplier_id: f.supplierId,
    amount: 100,
    paid_on: "2026-11-01T01:00:00Z",
    method: "fixture",
    created_event_id: f.eventId,
  });
  const supplierAllocation = await insert("supplier_payment_allocations", {
    organization_id: f.organizationId,
    supplier_id: f.supplierId,
    supplier_payment_id: supplierPayment,
    purchase_id: f.purchaseId,
    inventory_item_id: f.inventoryItemId,
    amount: 100,
    created_event_id: f.eventId,
  });
  await rejected(
    "UPDATE supplier_payment_allocations SET supplier_id = $1 WHERE id = $2",
    [otherSupplier, supplierAllocation],
    "23503",
  );
});

it("enforces nonnegative prices, positive cash, int32 bounds and millisecond UTC instants", async () => {
  const f = await fixture();
  await rejected(
    "UPDATE inventory_items SET merchandise_cost = -1 WHERE id = $1",
    [f.inventoryItemId],
    "23514",
  );
  await rejected(
    "UPDATE inventory_items SET asking_price = 2147483648 WHERE id = $1",
    [f.inventoryItemId],
    "22003",
  );
  await client.query(
    "UPDATE inventory_items SET asking_price = 2147483647 WHERE id = $1",
    [f.inventoryItemId],
  );
  for (const amount of [0, -1]) {
    await rejected(
      "INSERT INTO customer_payments (organization_id, customer_id, amount, paid_on, method, created_event_id) VALUES ($1,$2,$3,now(),'fixture',$4)",
      [f.organizationId, f.customerId, amount, f.eventId],
      "23514",
    );
  }
  const sale = await client.query<{ sold_on: Date }>(
    "SELECT sold_on FROM sales WHERE id = $1",
    [f.saleId],
  );
  expect(sale.rows[0]?.sold_on.toISOString()).toBe("2026-11-01T01:00:00.123Z");
  const user = await client.query<{ created_at: Date }>(
    "SELECT created_at FROM users WHERE id = $1",
    [f.actorUserId],
  );
  expect(user.rows[0]?.created_at).toBeInstanceOf(Date);
  await rejected(
    "INSERT INTO sales (organization_id, customer_id, created_event_id) VALUES ($1, $2, $3)",
    [f.organizationId, f.customerId, f.eventId],
    "23502",
  );
});

it("retains separate expense installments, completion checks and unique unit allocations", async () => {
  const f = await fixture();
  const expense = await insert("purchase_expenses", {
    organization_id: f.organizationId,
    amount: 10000,
    incurred_on: "2026-10-01T00:00:00Z",
    category: "fixture",
    created_event_id: f.eventId,
  });
  await insert("purchase_expense_payments", {
    organization_id: f.organizationId,
    purchase_expense_id: expense,
    amount: 3000,
    paid_on: "2026-10-23T00:00:00Z",
    method: "fixture",
    created_event_id: f.eventId,
  });
  await client.query(
    "UPDATE purchase_expenses SET settled_amount = 3000 WHERE id = $1",
    [expense],
  );
  await rejected(
    "UPDATE purchase_expenses SET settled_on = now() WHERE id = $1",
    [expense],
    "23514",
  );
  await rejected(
    "UPDATE purchase_expenses SET settled_amount = 10001 WHERE id = $1",
    [expense],
    "23514",
  );
  await insert("purchase_expense_payments", {
    organization_id: f.organizationId,
    purchase_expense_id: expense,
    amount: 7000,
    paid_on: "2026-10-26T00:00:00Z",
    method: "fixture",
    created_event_id: f.eventId,
  });
  await client.query(
    "UPDATE purchase_expenses SET settled_amount = 10000, settled_on = '2026-10-26T00:00:00Z' WHERE id = $1",
    [expense],
  );
  expect(
    (
      await client.query(
        "SELECT amount FROM purchase_expense_payments WHERE purchase_expense_id = $1 ORDER BY paid_on",
        [expense],
      )
    ).rows,
  ).toEqual([{ amount: 3000 }, { amount: 7000 }]);
  const values = {
    organization_id: f.organizationId,
    purchase_expense_id: expense,
    purchase_id: f.purchaseId,
    inventory_item_id: f.inventoryItemId,
    amount: 10000,
    created_event_id: f.eventId,
  };
  await insert("acquisition_expense_allocations", values);
  await rejected(
    "INSERT INTO acquisition_expense_allocations (organization_id,purchase_expense_id,purchase_id,inventory_item_id,amount,created_event_id) VALUES ($1,$2,$3,$4,0,$5)",
    [f.organizationId, expense, f.purchaseId, f.inventoryItemId, f.eventId],
    "23505",
  );
});

it("enforces unknown-Supplier and opening-Purchase identity with second-day UTC provenance", async () => {
  const f = await fixture();
  await insert("suppliers", {
    organization_id: f.organizationId,
    name: "Unknown",
    is_unknown: true,
    created_event_id: f.eventId,
  });
  await rejected(
    "INSERT INTO suppliers (organization_id,name,is_unknown,created_event_id) VALUES ($1,'duplicate',true,$2)",
    [f.organizationId, f.eventId],
    "23505",
  );
  await rejected(
    "UPDATE suppliers SET phone = 'invented' WHERE organization_id = $1 AND is_unknown",
    [f.organizationId],
    "23514",
  );
  const opening = await insert("purchases", {
    organization_id: f.organizationId,
    supplier_id: f.supplierId,
    is_opening: true,
    opening_month: "2026-10",
    ordered_on: "2026-10-02T00:00:00Z",
    created_event_id: f.eventId,
  });
  await rejected(
    "UPDATE purchases SET ordered_on = '2026-10-01T00:00:00Z' WHERE id = $1",
    [opening],
    "23514",
  );
  await rejected(
    "UPDATE purchases SET opening_month = '2026-13' WHERE id = $1",
    [opening],
    "22008",
  );
  await rejected(
    "INSERT INTO purchases (organization_id,supplier_id,is_opening,opening_month,ordered_on,created_event_id) SELECT organization_id,supplier_id,is_opening,opening_month,ordered_on,created_event_id FROM purchases WHERE id = $1",
    [opening],
    "23505",
  );
});

it("checks global/owned audit scope and reversals despite nullable Organization columns", async () => {
  const a = await fixture();
  const b = await fixture();
  const globalChange = await insert("business_event_changes", {
    business_event_id: a.globalEventId,
    sequence: 1,
    change_kind: "fixture",
    product_id: a.productId,
    after_facts: { name: "Fixture" },
  });
  const ownedChange = await insert("business_event_changes", {
    business_event_id: a.eventId,
    organization_id: a.organizationId,
    sequence: 1,
    change_kind: "fixture",
    inventory_item_id: a.inventoryItemId,
    after_facts: { status: "received" },
  });
  await rejected(
    "UPDATE business_event_changes SET business_event_id = $1, sequence = 2 WHERE id = $2",
    [a.eventId, globalChange],
    "23503",
  );
  await rejected(
    "UPDATE business_event_changes SET reverses_change_id = $1 WHERE id = $2",
    [ownedChange, globalChange],
    "23503",
  );
  await rejected(
    "UPDATE business_events SET reverses_event_id = $1 WHERE id = $2",
    [a.eventId, a.globalEventId],
    "23503",
  );
  await rejected(
    "UPDATE business_events SET reverses_event_id = $1 WHERE id = $2",
    [b.eventId, a.eventId],
    "23503",
  );
  await rejected(
    "UPDATE business_event_changes SET inventory_item_id = $1 WHERE id = $2",
    [b.inventoryItemId, ownedChange],
    "23503",
  );
  await rejected(
    "UPDATE business_event_changes SET sale_item_id = 1 WHERE id = $1",
    [ownedChange],
    "23514",
  );
  await rejected(
    "UPDATE business_event_changes SET after_facts = NULL WHERE id = $1",
    [ownedChange],
    "23514",
  );
});

it("retains identifiable typed audit after permitted never-funded line deletion", async () => {
  const f = await fixture();
  const line = await insert("sale_items", {
    organization_id: f.organizationId,
    sale_id: f.saleId,
    inventory_item_id: f.inventoryItemId,
    agreed_price: 0,
    recognized_acquisition_cost: 0,
    created_event_id: f.eventId,
  });
  const facts = {
    saleId: f.saleId,
    inventoryItemId: f.inventoryItemId,
    productId: f.productId,
    agreedPrice: 0,
  };
  const change = await insert("business_event_changes", {
    business_event_id: f.eventId,
    organization_id: f.organizationId,
    sequence: 1,
    change_kind: "sale_item_removed_fixture",
    sale_item_id: line,
    before_facts: facts,
  });
  await client.query("DELETE FROM sale_items WHERE id = $1", [line]);
  expect(
    (
      await client.query(
        "SELECT sale_item_id, before_facts FROM business_event_changes WHERE id = $1",
        [change],
      )
    ).rows,
  ).toEqual([{ sale_item_id: line, before_facts: facts }]);
  expect(
    (await client.query("SELECT id FROM sales WHERE id = $1", [f.saleId]))
      .rowCount,
  ).toBe(1);
  // Reintroducing the same physical unit creates a distinct historical line ID.
  const next = await insert("sale_items", {
    organization_id: f.organizationId,
    sale_id: f.saleId,
    inventory_item_id: f.inventoryItemId,
    agreed_price: 0,
    recognized_acquisition_cost: 0,
    created_event_id: f.eventId,
  });
  expect(next).not.toBe(line);
});

it("allows release/resale history and one Return per original line", async () => {
  const f = await fixture();
  const values = {
    organization_id: f.organizationId,
    sale_id: f.saleId,
    inventory_item_id: f.inventoryItemId,
    agreed_price: 0,
    recognized_acquisition_cost: 0,
    created_event_id: f.eventId,
  };
  const line = await insert("sale_items", values);
  await rejected(
    "INSERT INTO sale_items (organization_id,sale_id,inventory_item_id,agreed_price,recognized_acquisition_cost,created_event_id) VALUES ($1,$2,$3,0,0,$4)",
    [f.organizationId, f.secondSaleId, f.inventoryItemId, f.eventId],
    "23505",
  );
  await client.query(
    "UPDATE sale_items SET released_event_id = $1 WHERE id = $2",
    [f.eventId, line],
  );
  await insert("sale_items", { ...values, sale_id: f.secondSaleId });
  const returnId = await insert("returns", {
    organization_id: f.organizationId,
    sale_id: f.saleId,
    received_on: "2026-11-01T00:00:00Z",
    created_event_id: f.eventId,
  });
  await insert("return_items", {
    organization_id: f.organizationId,
    return_id: returnId,
    sale_id: f.saleId,
    sale_item_id: line,
    approved_for_sale: false,
  });
  await rejected(
    "INSERT INTO return_items (organization_id,return_id,sale_id,sale_item_id,approved_for_sale) VALUES ($1,$2,$3,$4,false)",
    [f.organizationId, returnId, f.saleId, line],
    "23505",
  );
});

// Use overlapping real sessions. The losing statement must wait on the winner's
// unique-index transaction lock, then fail after the winner commits.
async function race(kind: "commitment" | "collection") {
  // Committed fixture is visible to both independent sessions. Keep this one
  // test transaction separate from the per-test rollback fixture.
  const setup = await database.db.$client.connect();
  const first = await database.db.$client.connect();
  const second = await database.db.$client.connect();
  let f: Awaited<ReturnType<typeof fixture>> | undefined;
  try {
    await setup.query("BEGIN");
    f = await fixture(setup);
    await setup.query("COMMIT");
    await first.query("BEGIN");
    await second.query("BEGIN");
    const firstStatement =
      kind === "collection"
        ? first.query(
            "UPDATE inventory_items SET sale_status = 'collection' WHERE id = $1",
            [f.inventoryItemId],
          )
        : first.query(
            "INSERT INTO sale_items (organization_id,sale_id,inventory_item_id,agreed_price,recognized_acquisition_cost,created_event_id) VALUES ($1,$2,$3,0,0,$4)",
            [f.organizationId, f.saleId, f.inventoryItemId, f.eventId],
          );
    await firstStatement;
    const pid = (
      await second.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")
    ).rows[0]?.pid;
    const competing = (
      kind === "collection"
        ? second.query(
            "UPDATE inventory_items SET sale_status = 'collection' WHERE id = $1",
            [f.secondItemId],
          )
        : second.query(
            "INSERT INTO sale_items (organization_id,sale_id,inventory_item_id,agreed_price,recognized_acquisition_cost,created_event_id) VALUES ($1,$2,$3,0,0,$4)",
            [f.organizationId, f.secondSaleId, f.inventoryItemId, f.eventId],
          )
    ).then(
      () => null,
      (error: unknown) => error,
    );
    let waiting = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const result = await setup.query<{ waiting: boolean }>(
        "SELECT wait_event_type = 'Lock' AS waiting FROM pg_stat_activity WHERE pid = $1",
        [pid],
      );
      if (result.rows[0]?.waiting) {
        waiting = true;
        break;
      }
      await setup.query("SELECT pg_sleep(0.01)");
    }
    expect(waiting).toBe(true);
    await first.query("COMMIT");
    expect(await competing).toMatchObject({ code: "23505" });
    await second.query("ROLLBACK");
    const table = kind === "collection" ? "inventory_items" : "sale_items";
    const predicate =
      kind === "collection"
        ? "sale_status = 'collection'"
        : "released_event_id IS NULL";
    expect(
      (
        await setup.query<{ count: number }>(
          `SELECT count(*)::integer AS count FROM ${table} WHERE organization_id = $1 AND ${predicate}`,
          [f.organizationId],
        )
      ).rows[0]?.count,
    ).toBe(1);
  } finally {
    await first.query("ROLLBACK");
    await second.query("ROLLBACK");
    // The suite's final TRUNCATE removes committed race fixtures.
    setup.release();
    first.release();
    second.release();
  }
}

it("serializes competing active commitments without losing Return/resale history", async () => {
  await race("commitment");
});
it("serializes competing collection membership for the same Organization/Product", async () => {
  await race("collection");
});

it("round-trips the compiled typed schema through Drizzle", async () => {
  await database.db.transaction(async (transaction) => {
    const [organization] = await transaction
      .insert(schema.organizations)
      .values({ name: "Typed fixture" })
      .returning();
    expect(organization?.createdAt).toBeInstanceOf(Date);
    if (!organization) throw new Error("Missing typed fixture.");
    const loaded = await transaction
      .select()
      .from(schema.organizations)
      .where(eq(schema.organizations.id, organization.id));
    expect(loaded).toEqual([organization]);
    await transaction
      .delete(schema.organizations)
      .where(eq(schema.organizations.id, organization.id));
  });
});

it("bounds CLI lock waits on the actual migration connection and sanitizes failures", async () => {
  // Reading migration history needs ACCESS SHARE; this conflicts with the lock.
  await client.query(
    "LOCK TABLE drizzle.__drizzle_migrations IN ACCESS EXCLUSIVE MODE",
  );
  const started = performance.now();
  const pending = applyCommand().then(
    () => null,
    (error: unknown) => error,
  );
  // Verify actual backend settings through pg_stat_activity while CLI is waiting.
  const observer = await database.db.$client.connect();
  try {
    let options = "";
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const activity = await observer.query<{ query: string }>(
        "SELECT query FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock' AND query LIKE '%__drizzle_migrations%' AND pid <> pg_backend_pid()",
      );
      if (activity.rowCount) {
        options = activity.rows[0]?.query ?? "";
        break;
      }
      await observer.query("SELECT pg_sleep(0.02)");
    }
    expect(options).toContain("__drizzle_migrations");
    const failure = await pending;
    expect(failure).toMatchObject({ code: 1 });
    expect(String(failure)).not.toContain(config.password);
    expect(performance.now() - started).toBeGreaterThan(4_500);
    expect(performance.now() - started).toBeLessThan(9_000);
  } finally {
    observer.release();
  }
});

it("rejects invalid targets and wrong credentials without exposing injected values", async () => {
  for (const environment of [
    { ...process.env, DB_TARGET: "test", PGDATABASE: "storage_minis_dev" },
    { ...process.env, PGPASSWORD: "deliberately-invalid-fixture-password" },
  ]) {
    const failure: unknown = await applyCommand(environment).then(
      () => null,
      (error: unknown) => error,
    );
    expect(failure).toMatchObject({ code: 1 });
    expect(String(failure)).not.toContain(config.password);
    expect(String(failure)).not.toContain(
      "deliberately-invalid-fixture-password",
    );
  }
});

it("interrupts a blocked migration without leaking its backend or changing history", async () => {
  const history = await client.query(
    "SELECT * FROM drizzle.__drizzle_migrations ORDER BY id",
  );
  await client.query(
    "LOCK TABLE drizzle.__drizzle_migrations IN ACCESS EXCLUSIVE MODE",
  );
  const child = spawn(
    process.execPath,
    ["--import", "tsx", "scripts/migrate.ts"],
    {
      cwd: packageRoot,
      stdio: ["ignore", "ignore", "ignore"],
    },
  );
  const exited = new Promise<number | null>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", resolve);
  });
  const deadline = setTimeout(() => child.kill("SIGKILL"), 10_000);
  const observer = await database.db.$client.connect();
  try {
    let pid: number | undefined;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const activity = await observer.query<{ pid: number }>(
        "SELECT pid FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock' AND query LIKE '%__drizzle_migrations%' AND pid <> pg_backend_pid()",
      );
      pid = activity.rows[0]?.pid;
      if (pid !== undefined) break;
      await observer.query("SELECT pg_sleep(0.02)");
    }
    expect(pid).toBeTypeOf("number");
    child.kill("SIGTERM");
    expect(await exited).toBe(1);
    // PostgreSQL can observe a closed peer only after its lock wait wakes.
    // Require backend removal within the configured five-second lock bound.
    let remaining = 1;
    for (let attempt = 0; attempt < 120; attempt += 1) {
      const activity = await observer.query<{ count: number }>(
        "SELECT count(*)::integer AS count FROM pg_stat_activity WHERE pid = $1",
        [pid],
      );
      remaining = activity.rows[0]?.count ?? 1;
      if (remaining === 0) break;
      await observer.query("SELECT pg_sleep(0.05)");
    }
    expect(remaining).toBe(0);
    expect(
      (
        await client.query(
          "SELECT * FROM drizzle.__drizzle_migrations ORDER BY id",
        )
      ).rows,
    ).toEqual(history.rows);
  } finally {
    clearTimeout(deadline);
    if (child.exitCode === null && child.signalCode === null)
      child.kill("SIGKILL");
    await exited;
    observer.release();
  }
});
