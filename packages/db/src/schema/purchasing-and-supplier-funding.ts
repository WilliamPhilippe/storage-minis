import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import type { PgTableExtraConfigValue } from "drizzle-orm/pg-core";
import {
  expenseCompleteness,
  purchaseLifecycle,
  supplierSettlementOutcome,
  supplierType,
} from "./enums.js";
import { inventoryItems } from "./catalog-and-inventory.js";
import { organizations } from "./identity-and-access.js";
import { businessEvents, losses } from "./losses-and-shared-history.js";

export const suppliers = pgTable(
  "suppliers",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    name: text("name").notNull(),
    phone: text("phone"),
    type: supplierType("type"),
    isUnknown: boolean("is_unknown").notNull().default(false),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("suppliers_positive_id", sql`${t.id} > 0`),
    check(
      "known_supplier_has_contact_and_type",
      sql`(is_unknown OR (phone IS NOT NULL AND type IS NOT NULL))`,
    ),
    check(
      "unknown_supplier_has_no_fabricated_details",
      sql`(NOT is_unknown OR (phone IS NULL AND type IS NULL))`,
    ),
    index("suppliers_organization_idx").on(t.organizationId),
    unique("suppliers_key_1").on(t.organizationId, t.id),
    uniqueIndex("one_unknown_supplier")
      .on(...[t.organizationId])
      .where(sql`is_unknown`),
    foreignKey({
      name: "owner_suppliers",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_suppliers",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const purchases = pgTable(
  "purchases",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    supplierId: integer("supplier_id").notNull(),
    orderedOn: timestamp("ordered_on", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }).notNull(),
    isOpening: boolean("is_opening").notNull().default(false),
    openingMonth: varchar("opening_month", { length: 7 }),
    openingSourceDescription: text("opening_source_description"),
    openingEvidence: jsonb("opening_evidence"),
    lifecycle: purchaseLifecycle("lifecycle").notNull().default("open"),
    expenseCompleteness: expenseCompleteness("expense_completeness")
      .notNull()
      .default("unknown"),
    expensesConfirmedEventId: integer("expenses_confirmed_event_id"),
    incomingShippingNotes: text("incoming_shipping_notes"),
    completedEventId: integer("completed_event_id"),
    canceledEventId: integer("canceled_event_id"),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("purchases_positive_id", sql`${t.id} > 0`),
    check(
      "opening_purchase_has_month",
      sql`((opening_month IS NOT NULL) = is_opening)`,
    ),
    check(
      "valid_opening_month",
      sql`(opening_month IS NULL OR (opening_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$' AND left(opening_month, 4) <> '0000'))`,
    ),
    check(
      "opening_purchase_uses_second_day",
      sql`(NOT is_opening OR ordered_on = (opening_month || '-02T00:00:00Z')::timestamptz)`,
    ),
    index("purchases_organization_idx").on(t.organizationId),
    unique("purchases_key_1").on(t.organizationId, t.id),
    unique("purchases_key_2").on(t.organizationId, t.supplierId, t.id),
    uniqueIndex("one_opening_purchase")
      .on(...[t.organizationId, t.supplierId, t.openingMonth])
      .where(sql`is_opening`),
    foreignKey({
      name: "owner_purchases",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "purchase_supplier",
      columns: [t.organizationId, t.supplierId],
      foreignColumns: [suppliers.organizationId, suppliers.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_purchases",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "purchases_expenses_confirmed",
      columns: [t.organizationId, t.expensesConfirmedEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "purchases_completed",
      columns: [t.organizationId, t.completedEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "purchases_canceled",
      columns: [t.organizationId, t.canceledEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const purchaseItems = pgTable(
  "purchase_items",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    purchaseId: integer("purchase_id").notNull(),
    orderedQuantity: integer("ordered_quantity").notNull(),
    merchandiseTotal: integer("merchandise_total"),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("purchase_items_positive_id", sql`${t.id} > 0`),
    check("positive_ordered_quantity", sql`ordered_quantity > 0`),
    check(
      "purchase_items_merchandise_total_nonnegative",
      sql`${t.merchandiseTotal} >= 0`,
    ),
    index("purchase_items_organization_idx").on(t.organizationId),
    unique("purchase_items_key_1").on(t.organizationId, t.purchaseId, t.id),
    unique("purchase_items_key_2").on(t.organizationId, t.id),
    foreignKey({
      name: "owner_purchase_items",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "purchase_line_header",
      columns: [t.organizationId, t.purchaseId],
      foreignColumns: [purchases.organizationId, purchases.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_purchase_items",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const supplierPayments = pgTable(
  "supplier_payments",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    supplierId: integer("supplier_id").notNull(),
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
    check("supplier_payments_positive_id", sql`${t.id} > 0`),
    check("supplier_payments_positive_amount", sql`${t.amount} > 0`),
    index("supplier_payments_organization_idx").on(t.organizationId),
    unique("supplier_payments_key_1").on(t.organizationId, t.supplierId, t.id),
    unique("supplier_payments_key_2").on(t.organizationId, t.id),
    foreignKey({
      name: "owner_supplier_payments",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "supplier_payment_party",
      columns: [t.organizationId, t.supplierId],
      foreignColumns: [suppliers.organizationId, suppliers.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_supplier_payments",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const supplierPaymentAllocations = pgTable(
  "supplier_payment_allocations",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    supplierId: integer("supplier_id").notNull(),
    supplierPaymentId: integer("supplier_payment_id").notNull(),
    purchaseId: integer("purchase_id").notNull(),
    inventoryItemId: integer("inventory_item_id").notNull(),
    amount: integer("amount").notNull(),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("supplier_payment_allocations_positive_id", sql`${t.id} > 0`),
    check("supplier_payment_allocations_positive_amount", sql`${t.amount} > 0`),
    index("supplier_payment_allocations_organization_idx").on(t.organizationId),
    unique("supplier_payment_allocations_key_1").on(t.organizationId, t.id),
    foreignKey({
      name: "owner_supplier_payment_allocations",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "supplier_allocation_payment_party",
      columns: [t.organizationId, t.supplierId, t.supplierPaymentId],
      foreignColumns: [
        supplierPayments.organizationId,
        supplierPayments.supplierId,
        supplierPayments.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "supplier_allocation_purchase_party",
      columns: [t.organizationId, t.supplierId, t.purchaseId],
      foreignColumns: [
        purchases.organizationId,
        purchases.supplierId,
        purchases.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "supplier_allocation_unit_purchase",
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
      name: "created_supplier_payment_allocations",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const supplierRefunds = pgTable(
  "supplier_refunds",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    supplierId: integer("supplier_id").notNull(),
    settlementId: integer("settlement_id").notNull(),
    amount: integer("amount").notNull(),
    receivedOn: timestamp("received_on", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }).notNull(),
    method: text("method").notNull(),
    relatedLossId: integer("related_loss_id"),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("supplier_refunds_positive_id", sql`${t.id} > 0`),
    check("supplier_refunds_positive_amount", sql`${t.amount} > 0`),
    index("supplier_refunds_organization_idx").on(t.organizationId),
    unique("supplier_refunds_key_1").on(t.organizationId, t.id),
    foreignKey({
      name: "owner_supplier_refunds",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "supplier_refund_party",
      columns: [t.organizationId, t.supplierId],
      foreignColumns: [suppliers.organizationId, suppliers.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "supplier_refund_original_loss",
      columns: [t.organizationId, t.relatedLossId],
      foreignColumns: [losses.organizationId, losses.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_supplier_refunds",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "supplier_refund_settlement_party",
      columns: [t.organizationId, t.supplierId, t.settlementId],
      foreignColumns: [
        supplierSettlements.organizationId,
        supplierSettlements.supplierId,
        supplierSettlements.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const supplierSettlements = pgTable(
  "supplier_settlements",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    supplierId: integer("supplier_id").notNull(),
    purchaseId: integer("purchase_id"),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("supplier_settlements_positive_id", sql`${t.id} > 0`),
    index("supplier_settlements_organization_idx").on(t.organizationId),
    unique("supplier_settlements_key_1").on(t.organizationId, t.id),
    unique("supplier_settlements_key_2").on(
      t.organizationId,
      t.supplierId,
      t.id,
    ),
    foreignKey({
      name: "owner_supplier_settlements",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "supplier_settlement_supplier",
      columns: [t.organizationId, t.supplierId],
      foreignColumns: [suppliers.organizationId, suppliers.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "supplier_settlement_purchase",
      columns: [t.organizationId, t.supplierId, t.purchaseId],
      foreignColumns: [
        purchases.organizationId,
        purchases.supplierId,
        purchases.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_supplier_settlements",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const supplierSettlementSourceAllocations = pgTable(
  "supplier_settlement_source_allocations",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    settlementId: integer("settlement_id").notNull(),
    sourceSupplierPaymentAllocationId: integer(
      "source_supplier_payment_allocation_id",
    ).notNull(),
    amount: integer("amount").notNull(),
    outcome: supplierSettlementOutcome("outcome").notNull(),
    supplierRefundId: integer("supplier_refund_id"),
    targetSupplierPaymentAllocationId: integer(
      "target_supplier_payment_allocation_id",
    ),
    lossId: integer("loss_id"),
    relatedPriorLossId: integer("related_prior_loss_id"),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check(
      "supplier_settlement_source_allocations_positive_id",
      sql`${t.id} > 0`,
    ),
    check("positive_supplier_settlement_portion", sql`amount > 0`),
    check(
      "one_supplier_settlement_outcome",
      sql`((outcome = 'refund' AND target_supplier_payment_allocation_id IS NULL AND loss_id IS NULL) OR (outcome = 'reassignment' AND target_supplier_payment_allocation_id IS NOT NULL AND supplier_refund_id IS NULL AND loss_id IS NULL) OR (outcome = 'loss' AND loss_id IS NOT NULL AND supplier_refund_id IS NULL AND target_supplier_payment_allocation_id IS NULL))`,
    ),
    index("supplier_settlement_source_allocations_organization_idx").on(
      t.organizationId,
    ),
    unique("supplier_settlement_source_allocations_key_1").on(
      t.organizationId,
      t.id,
    ),
    foreignKey({
      name: "owner_supplier_settlement_sources",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "supplier_settlement_source_header",
      columns: [t.organizationId, t.settlementId],
      foreignColumns: [
        supplierSettlements.organizationId,
        supplierSettlements.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "supplier_settlement_source_payment",
      columns: [t.organizationId, t.sourceSupplierPaymentAllocationId],
      foreignColumns: [
        supplierPaymentAllocations.organizationId,
        supplierPaymentAllocations.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "supplier_settlement_source_refund",
      columns: [t.organizationId, t.supplierRefundId],
      foreignColumns: [supplierRefunds.organizationId, supplierRefunds.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "supplier_settlement_source_target",
      columns: [t.organizationId, t.targetSupplierPaymentAllocationId],
      foreignColumns: [
        supplierPaymentAllocations.organizationId,
        supplierPaymentAllocations.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "supplier_settlement_source_loss",
      columns: [t.organizationId, t.lossId],
      foreignColumns: [losses.organizationId, losses.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "supplier_settlement_source_prior_loss",
      columns: [t.organizationId, t.relatedPriorLossId],
      foreignColumns: [losses.organizationId, losses.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_supplier_settlement_source_allocations",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);
