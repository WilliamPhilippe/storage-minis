import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { PgTableExtraConfigValue } from "drizzle-orm/pg-core";
import { inventoryItems } from "./catalog-and-inventory.js";
import { organizations } from "./identity-and-access.js";
import { businessEvents } from "./losses-and-shared-history.js";

export const customers = pgTable(
  "customers",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    name: text("name").notNull(),
    phone: text("phone"),
    addressLine_1: text("address_line_1"),
    addressLine_2: text("address_line_2"),
    addressNeighborhood: text("address_neighborhood"),
    addressCity: text("address_city"),
    addressRegion: text("address_region"),
    addressPostalCode: text("address_postal_code"),
    addressCountry: text("address_country"),
    notes: text("notes"),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("customers_positive_id", sql`${t.id} > 0`),
    check("customer_nonblank_name", sql`${t.name} ~ '[^[:space:]]'`),
    index("customers_organization_idx").on(t.organizationId),
    unique("customers_key_1").on(t.organizationId, t.id),
    foreignKey({
      name: "owner_customers",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_customers",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const sales = pgTable(
  "sales",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    customerId: integer("customer_id").notNull(),
    soldOn: timestamp("sold_on", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }).notNull(),
    dispatchedOn: timestamp("dispatched_on", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }),
    dispatchEventId: integer("dispatch_event_id"),
    trackingCode: text("tracking_code"),
    canceledEventId: integer("canceled_event_id"),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("sales_positive_id", sql`${t.id} > 0`),
    check(
      "dispatch_has_date_and_event",
      sql`((dispatched_on IS NULL) = (dispatch_event_id IS NULL))`,
    ),
    check(
      "ordinary_cancellation_before_dispatch",
      sql`(canceled_event_id IS NULL OR dispatch_event_id IS NULL)`,
    ),
    index("sales_organization_idx").on(t.organizationId),
    unique("sales_key_1").on(t.organizationId, t.id),
    unique("sales_key_2").on(t.organizationId, t.customerId, t.id),
    foreignKey({
      name: "owner_sales",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "sale_customer",
      columns: [t.organizationId, t.customerId],
      foreignColumns: [customers.organizationId, customers.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_sales",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "sales_dispatch",
      columns: [t.organizationId, t.dispatchEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "sales_canceled",
      columns: [t.organizationId, t.canceledEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const saleItems = pgTable(
  "sale_items",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    saleId: integer("sale_id").notNull(),
    inventoryItemId: integer("inventory_item_id").notNull(),
    agreedPrice: integer("agreed_price").notNull(),
    recognizedAcquisitionCost: integer("recognized_acquisition_cost").notNull(),
    releasedEventId: integer("released_event_id"),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("sale_items_positive_id", sql`${t.id} > 0`),
    check("sale_items_agreed_price_nonnegative", sql`${t.agreedPrice} >= 0`),
    check(
      "sale_items_recognized_acquisition_cost_nonnegative",
      sql`${t.recognizedAcquisitionCost} >= 0`,
    ),
    index("sale_items_organization_idx").on(t.organizationId),
    unique("sale_items_key_1").on(t.organizationId, t.saleId, t.id),
    uniqueIndex("one_active_item_commitment")
      .on(...[t.organizationId, t.inventoryItemId])
      .where(sql`released_event_id IS NULL`),
    foreignKey({
      name: "owner_sale_items",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "sale_line_header",
      columns: [t.organizationId, t.saleId],
      foreignColumns: [sales.organizationId, sales.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "sale_line_unit",
      columns: [t.organizationId, t.inventoryItemId],
      foreignColumns: [inventoryItems.organizationId, inventoryItems.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_sale_items",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "sale_items_released",
      columns: [t.organizationId, t.releasedEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const returns = pgTable(
  "returns",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    saleId: integer("sale_id").notNull(),
    receivedOn: timestamp("received_on", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }).notNull(),
    reason: text("reason"),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("returns_positive_id", sql`${t.id} > 0`),
    index("returns_organization_idx").on(t.organizationId),
    unique("returns_key_1").on(t.organizationId, t.saleId, t.id),
    unique("returns_key_2").on(t.organizationId, t.id),
    foreignKey({
      name: "owner_returns",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "return_original_sale",
      columns: [t.organizationId, t.saleId],
      foreignColumns: [sales.organizationId, sales.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_returns",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const returnItems = pgTable(
  "return_items",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    returnId: integer("return_id").notNull(),
    saleId: integer("sale_id").notNull(),
    saleItemId: integer("sale_item_id").notNull(),
    sealed: boolean("sealed"),
    damaged: boolean("damaged"),
    damageDescription: text("damage_description"),
    approvedForSale: boolean("approved_for_sale").notNull(),
    conditionNotes: text("condition_notes"),
  },
  (t): PgTableExtraConfigValue[] => [
    check("return_items_positive_id", sql`${t.id} > 0`),
    index("return_items_organization_idx").on(t.organizationId),
    unique("return_items_key_1").on(t.organizationId, t.id),
    unique("return_items_key_2").on(t.organizationId, t.saleItemId),
    foreignKey({
      name: "owner_return_items",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "return_line_header_sale",
      columns: [t.organizationId, t.saleId, t.returnId],
      foreignColumns: [returns.organizationId, returns.saleId, returns.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "return_line_original_sale_line",
      columns: [t.organizationId, t.saleId, t.saleItemId],
      foreignColumns: [
        saleItems.organizationId,
        saleItems.saleId,
        saleItems.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);
