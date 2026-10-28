import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { PgTableExtraConfigValue } from "drizzle-orm/pg-core";
import { expenseCompleteness, inventoryStatus, saleStatus } from "./enums.js";
import { organizations } from "./identity-and-access.js";
import { businessEvents } from "./losses-and-shared-history.js";
import { purchaseItems, purchases } from "./purchasing-and-supplier-funding.js";

export const products = pgTable(
  "products",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
    sku: text("sku").notNull(),
    brand: text("brand").notNull(),
    description: text("description"),
    images: text("images").array(),
    isChase: boolean("is_chase").notNull().default(false),
    registrationEventId: integer("registration_event_id").notNull(),
    registrationScope: integer("registration_scope")
      .generatedAlwaysAs(sql`0`)
      .notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("products_positive_id", sql`${t.id} > 0`),
    foreignKey({
      name: "product_registration",
      columns: [t.registrationEventId],
      foreignColumns: [businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "product_registration_global_scope",
      columns: [t.registrationEventId, t.registrationScope],
      foreignColumns: [businessEvents.id, businessEvents.scopeOrganizationId],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

// The immutable base36 function is installed before this table in the base migration.
export const inventoryItems = pgTable(
  "inventory_items",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    inventoryId: text("inventoryId")
      .generatedAlwaysAs(sql`public.inventory_id_base36(id)`)
      .notNull(),
    organizationId: integer("organization_id").notNull(),
    productId: integer("product_id").notNull(),
    purchaseId: integer("purchase_id").notNull(),
    purchaseItemId: integer("purchase_item_id").notNull(),
    merchandiseCost: integer("merchandise_cost"),
    sealed: boolean("sealed"),
    damaged: boolean("damaged"),
    damageDescription: text("damage_description"),
    privateNotes: text("private_notes"),
    askingPrice: integer("asking_price"),
    status: inventoryStatus("status").notNull(),
    saleStatus: saleStatus("sale_status").notNull().default("unapproved"),
    firstReceivedEventId: integer("first_received_event_id"),
    firstSaleApprovalEventId: integer("first_sale_approval_event_id"),
    removedEventId: integer("removed_event_id"),
    acquisitionExpenseCompleteness: expenseCompleteness(
      "acquisition_expense_completeness",
    )
      .notNull()
      .default("unknown"),
    finalizedAcquisitionCost: integer("finalized_acquisition_cost"),
    costFinalizedEventId: integer("cost_finalized_event_id"),
    createdEventId: integer("created_event_id").notNull(),
    publicDescription: text("public_description"),
    publicImages: text("public_images").array(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("inventory_items_positive_id", sql`${t.id} > 0`),
    check(
      "cost_snapshot_has_event",
      sql`((finalized_acquisition_cost IS NULL) = (cost_finalized_event_id IS NULL))`,
    ),
    check(
      "inventory_items_merchandise_cost_nonnegative",
      sql`${t.merchandiseCost} >= 0`,
    ),
    check(
      "inventory_items_asking_price_nonnegative",
      sql`${t.askingPrice} >= 0`,
    ),
    check(
      "inventory_items_finalized_acquisition_cost_nonnegative",
      sql`${t.finalizedAcquisitionCost} >= 0`,
    ),
    index("inventory_items_organization_idx").on(t.organizationId),
    unique("inventory_items_key_1").on(t.organizationId, t.purchaseId, t.id),
    unique("inventory_items_key_2").on(t.organizationId, t.id),
    unique("inventory_items_key_3").on(t.organizationId, t.inventoryId),
    uniqueIndex("one_collection_unit")
      .on(...[t.organizationId, t.productId])
      .where(sql`sale_status = 'collection'`),
    foreignKey({
      name: "owner_inventory_items",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "unit_global_product",
      columns: [t.productId],
      foreignColumns: [products.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "unit_purchase",
      columns: [t.organizationId, t.purchaseId],
      foreignColumns: [purchases.organizationId, purchases.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "unit_purchase_line",
      columns: [t.organizationId, t.purchaseId, t.purchaseItemId],
      foreignColumns: [
        purchaseItems.organizationId,
        purchaseItems.purchaseId,
        purchaseItems.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_inventory_items",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "inventory_items_first_received",
      columns: [t.organizationId, t.firstReceivedEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "inventory_items_first_sale_approval",
      columns: [t.organizationId, t.firstSaleApprovalEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "inventory_items_removed",
      columns: [t.organizationId, t.removedEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "inventory_items_cost_finalized",
      columns: [t.organizationId, t.costFinalizedEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);
