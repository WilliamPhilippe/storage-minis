import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import type { PgTableExtraConfigValue } from "drizzle-orm/pg-core";
import { acquisitionAllocationMethod } from "./enums.js";
import { inventoryItems } from "./catalog-and-inventory.js";
import { organizations } from "./identity-and-access.js";
import { businessEvents } from "./losses-and-shared-history.js";
import { sales } from "./sales-and-returns.js";

export const purchaseExpenses = pgTable(
  "purchase_expenses",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    amount: integer("amount").notNull(),
    incurredOn: timestamp("incurred_on", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }).notNull(),
    category: text("category").notNull(),
    context: text("context"),
    allocationMethod: acquisitionAllocationMethod("allocation_method")
      .notNull()
      .default("proportional_to_value"),
    settledAmount: integer("settled_amount").notNull().default(0),
    settledOn: timestamp("settled_on", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("purchase_expenses_positive_id", sql`${t.id} > 0`),
    check("positive_purchase_expense", sql`amount > 0`),
    check(
      "purchase_expense_payment_bounds",
      sql`(settled_amount >= 0 AND settled_amount <= amount)`,
    ),
    check(
      "purchase_expense_fully_paid_timestamp",
      sql`((settled_on IS NOT NULL) = (settled_amount = amount))`,
    ),
    index("purchase_expenses_organization_idx").on(t.organizationId),
    unique("purchase_expenses_key_1").on(t.organizationId, t.id),
    foreignKey({
      name: "owner_purchase_expenses",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_purchase_expenses",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const purchaseExpensePayments = pgTable(
  "purchase_expense_payments",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    purchaseExpenseId: integer("purchase_expense_id").notNull(),
    amount: integer("amount").notNull(),
    paidOn: timestamp("paid_on", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }).notNull(),
    method: text("method").notNull(),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("purchase_expense_payments_positive_id", sql`${t.id} > 0`),
    check("positive_purchase_expense_payment", sql`amount > 0`),
    index("purchase_expense_payments_organization_idx").on(t.organizationId),
    unique("purchase_expense_payments_key_1").on(t.organizationId, t.id),
    foreignKey({
      name: "owner_purchase_expense_payments",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "purchase_expense_payment_source",
      columns: [t.organizationId, t.purchaseExpenseId],
      foreignColumns: [purchaseExpenses.organizationId, purchaseExpenses.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_purchase_expense_payments",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const acquisitionExpenseAllocations = pgTable(
  "acquisition_expense_allocations",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    purchaseExpenseId: integer("purchase_expense_id").notNull(),
    purchaseId: integer("purchase_id").notNull(),
    inventoryItemId: integer("inventory_item_id").notNull(),
    amount: integer("amount").notNull(),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("acquisition_expense_allocations_positive_id", sql`${t.id} > 0`),
    check(
      "acquisition_expense_allocations_amount_nonnegative",
      sql`${t.amount} >= 0`,
    ),
    index("acquisition_expense_allocations_organization_idx").on(
      t.organizationId,
    ),
    unique("acquisition_expense_allocations_key_1").on(t.organizationId, t.id),
    unique("acquisition_expense_allocations_key_2").on(
      t.organizationId,
      t.purchaseExpenseId,
      t.inventoryItemId,
    ),
    foreignKey({
      name: "owner_acquisition_expense_allocations",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "expense_allocation_source",
      columns: [t.organizationId, t.purchaseExpenseId],
      foreignColumns: [purchaseExpenses.organizationId, purchaseExpenses.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "expense_allocation_unit_purchase",
      columns: [t.organizationId, t.purchaseId, t.inventoryItemId],
      foreignColumns: [
        inventoryItems.organizationId,
        inventoryItems.purchaseId,
        inventoryItems.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_acquisition_expense_allocations",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const saleExpenses = pgTable(
  "sale_expenses",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    saleId: integer("sale_id").notNull(),
    amount: integer("amount").notNull(),
    incurredOn: timestamp("incurred_on", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }).notNull(),
    category: text("category").notNull(),
    context: text("context"),
    settledAmount: integer("settled_amount").notNull().default(0),
    settledOn: timestamp("settled_on", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("sale_expenses_positive_id", sql`${t.id} > 0`),
    check("positive_sale_expense", sql`amount > 0`),
    check(
      "sale_expense_payment_bounds",
      sql`(settled_amount >= 0 AND settled_amount <= amount)`,
    ),
    check(
      "sale_expense_fully_paid_timestamp",
      sql`((settled_on IS NOT NULL) = (settled_amount = amount))`,
    ),
    index("sale_expenses_organization_idx").on(t.organizationId),
    unique("sale_expenses_key_1").on(t.organizationId, t.id),
    foreignKey({
      name: "owner_sale_expenses",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "selling_expense_sale",
      columns: [t.organizationId, t.saleId],
      foreignColumns: [sales.organizationId, sales.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_sale_expenses",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const saleExpensePayments = pgTable(
  "sale_expense_payments",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    saleExpenseId: integer("sale_expense_id").notNull(),
    amount: integer("amount").notNull(),
    paidOn: timestamp("paid_on", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }).notNull(),
    method: text("method").notNull(),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("sale_expense_payments_positive_id", sql`${t.id} > 0`),
    check("positive_sale_expense_payment", sql`amount > 0`),
    index("sale_expense_payments_organization_idx").on(t.organizationId),
    unique("sale_expense_payments_key_1").on(t.organizationId, t.id),
    foreignKey({
      name: "owner_sale_expense_payments",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "sale_expense_payment_source",
      columns: [t.organizationId, t.saleExpenseId],
      foreignColumns: [saleExpenses.organizationId, saleExpenses.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_sale_expense_payments",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);
