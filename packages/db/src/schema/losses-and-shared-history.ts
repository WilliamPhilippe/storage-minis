import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import type { PgTableExtraConfigValue } from "drizzle-orm/pg-core";
import { businessEventScope } from "./enums.js";
import {
  acquisitionExpenseAllocations,
  purchaseExpensePayments,
  purchaseExpenses,
  saleExpensePayments,
  saleExpenses,
} from "./acquisition-and-selling-expenses.js";
import { inventoryItems, products } from "./catalog-and-inventory.js";
import {
  customerPaymentAllocations,
  customerPayments,
  customerRefunds,
  customerSettlementSourceAllocations,
  customerSettlements,
  retainedIncome,
  retainedIncomeAllocations,
} from "./customer-funding-and-retention.js";
import { organizations, users } from "./identity-and-access.js";
import {
  purchaseItems,
  purchases,
  supplierPaymentAllocations,
  supplierPayments,
  supplierRefunds,
  supplierSettlementSourceAllocations,
  supplierSettlements,
  suppliers,
} from "./purchasing-and-supplier-funding.js";
import { customers, returnItems, returns, sales } from "./sales-and-returns.js";

export const losses = pgTable(
  "losses",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    inventoryItemId: integer("inventory_item_id"),
    purchaseId: integer("purchase_id"),
    saleId: integer("sale_id"),
    amount: integer("amount").notNull(),
    occurredOn: timestamp("occurred_on", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }).notNull(),
    reason: text("reason").notNull(),
    reversedEventId: integer("reversed_event_id"),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("losses_positive_id", sql`${t.id} > 0`),
    check("losses_amount_nonnegative", sql`${t.amount} >= 0`),
    index("losses_organization_idx").on(t.organizationId),
    unique("losses_key_1").on(t.organizationId, t.id),
    foreignKey({
      name: "owner_losses",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "loss_inventory_item",
      columns: [t.organizationId, t.inventoryItemId],
      foreignColumns: [inventoryItems.organizationId, inventoryItems.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "loss_purchase",
      columns: [t.organizationId, t.purchaseId],
      foreignColumns: [purchases.organizationId, purchases.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "loss_sale",
      columns: [t.organizationId, t.saleId],
      foreignColumns: [sales.organizationId, sales.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_losses",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "losses_reversed",
      columns: [t.organizationId, t.reversedEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const businessEvents = pgTable(
  "business_events",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    scope: businessEventScope("scope").notNull(),
    organizationId: integer("organization_id"),
    contextOrganizationId: integer("context_organization_id"),
    actorUserId: integer("actor_user_id").notNull(),
    actionType: text("action_type").notNull(),
    occurredAt: timestamp("occurred_at", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }).notNull(),
    recordedAt: timestamp("recorded_at", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    reason: text("reason"),
    reversesEventId: integer("reverses_event_id"),
    scopeOrganizationId: integer("scope_organization_id")
      .generatedAlwaysAs(sql`coalesce(organization_id, 0)`)
      .notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("business_events_positive_id", sql`${t.id} > 0`),
    check(
      "business_event_scope_matches_owner",
      sql`((scope = 'organization' AND organization_id IS NOT NULL) OR (scope = 'global_product' AND organization_id IS NULL))`,
    ),
    unique("business_events_key_1").on(t.scopeOrganizationId, t.id),
    unique("business_events_key_2").on(t.organizationId, t.id),
    unique("business_events_key_3").on(t.id, t.scopeOrganizationId),
    foreignKey({
      name: "owner_business_events",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "event_actor",
      columns: [t.actorUserId],
      foreignColumns: [users.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "event_context",
      columns: [t.contextOrganizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "event_reversal_identity",
      columns: [t.reversesEventId],
      foreignColumns: [businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "event_reversal_owner",
      columns: [t.scopeOrganizationId, t.reversesEventId],
      foreignColumns: [businessEvents.scopeOrganizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

// S07: saleId/saleItemId are historical subjects, validated and snapshotted
// by the future writer transaction. All other subject FKs remain restrictive.
export const businessEventChanges = pgTable(
  "business_event_changes",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    businessEventId: integer("business_event_id").notNull(),
    organizationId: integer("organization_id"),
    sequence: integer("sequence").notNull(),
    changeKind: text("change_kind").notNull(),
    productId: integer("product_id"),
    membershipUserId: integer("membership_user_id"),
    inventoryItemId: integer("inventory_item_id"),
    supplierId: integer("supplier_id"),
    purchaseId: integer("purchase_id"),
    purchaseItemId: integer("purchase_item_id"),
    supplierPaymentId: integer("supplier_payment_id"),
    supplierPaymentAllocationId: integer("supplier_payment_allocation_id"),
    supplierRefundId: integer("supplier_refund_id"),
    purchaseExpenseId: integer("purchase_expense_id"),
    purchaseExpensePaymentId: integer("purchase_expense_payment_id"),
    acquisitionExpenseAllocationId: integer(
      "acquisition_expense_allocation_id",
    ),
    customerId: integer("customer_id"),
    saleId: integer("sale_id"),
    saleItemId: integer("sale_item_id"),
    saleExpenseId: integer("sale_expense_id"),
    saleExpensePaymentId: integer("sale_expense_payment_id"),
    customerPaymentId: integer("customer_payment_id"),
    customerPaymentAllocationId: integer("customer_payment_allocation_id"),
    customerRefundId: integer("customer_refund_id"),
    returnId: integer("return_id"),
    returnItemId: integer("return_item_id"),
    retainedIncomeId: integer("retained_income_id"),
    retainedIncomeAllocationId: integer("retained_income_allocation_id"),
    lossId: integer("loss_id"),
    customerSettlementId: integer("customer_settlement_id"),
    customerSettlementSourceAllocationId: integer(
      "customer_settlement_source_allocation_id",
    ),
    supplierSettlementId: integer("supplier_settlement_id"),
    supplierSettlementSourceAllocationId: integer(
      "supplier_settlement_source_allocation_id",
    ),
    beforeFacts: jsonb("before_facts"),
    afterFacts: jsonb("after_facts"),
    reversesChangeId: integer("reverses_change_id"),
    scopeOrganizationId: integer("scope_organization_id")
      .generatedAlwaysAs(sql`coalesce(organization_id, 0)`)
      .notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("business_event_changes_positive_id", sql`${t.id} > 0`),
    check(
      "one_typed_business_subject",
      sql`num_nonnulls(product_id, membership_user_id, inventory_item_id, supplier_id, purchase_id, purchase_item_id, supplier_payment_id, supplier_payment_allocation_id, supplier_refund_id, purchase_expense_id, purchase_expense_payment_id, acquisition_expense_allocation_id, customer_id, sale_id, sale_item_id, sale_expense_id, sale_expense_payment_id, customer_payment_id, customer_payment_allocation_id, customer_refund_id, return_id, return_item_id, retained_income_id, retained_income_allocation_id, loss_id, customer_settlement_id, customer_settlement_source_allocation_id, supplier_settlement_id, supplier_settlement_source_allocation_id) = 1`,
    ),
    check(
      "change_subject_matches_scope",
      sql`((organization_id IS NULL AND product_id IS NOT NULL) OR (organization_id IS NOT NULL AND product_id IS NULL))`,
    ),
    check(
      "preserved_business_facts",
      sql`(before_facts IS NOT NULL OR after_facts IS NOT NULL)`,
    ),
    check("positive_change_sequence", sql`sequence > 0`),
    unique("business_event_changes_key_1").on(t.scopeOrganizationId, t.id),
    unique("business_event_changes_key_2").on(t.businessEventId, t.sequence),
    foreignKey({
      name: "owner_business_event_changes",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_event_identity",
      columns: [t.businessEventId],
      foreignColumns: [businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_event_owner",
      columns: [t.scopeOrganizationId, t.businessEventId],
      foreignColumns: [businessEvents.scopeOrganizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_global_product",
      columns: [t.productId],
      foreignColumns: [products.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_membership_user",
      columns: [t.membershipUserId],
      foreignColumns: [users.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_reversal_identity",
      columns: [t.reversesChangeId],
      foreignColumns: [businessEventChanges.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_reversal_owner",
      columns: [t.scopeOrganizationId, t.reversesChangeId],
      foreignColumns: [
        businessEventChanges.scopeOrganizationId,
        businessEventChanges.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_inventory_item",
      columns: [t.organizationId, t.inventoryItemId],
      foreignColumns: [inventoryItems.organizationId, inventoryItems.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_supplier",
      columns: [t.organizationId, t.supplierId],
      foreignColumns: [suppliers.organizationId, suppliers.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_purchase",
      columns: [t.organizationId, t.purchaseId],
      foreignColumns: [purchases.organizationId, purchases.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_purchase_item",
      columns: [t.organizationId, t.purchaseItemId],
      foreignColumns: [purchaseItems.organizationId, purchaseItems.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_supplier_payment",
      columns: [t.organizationId, t.supplierPaymentId],
      foreignColumns: [supplierPayments.organizationId, supplierPayments.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_supplier_payment_allocation",
      columns: [t.organizationId, t.supplierPaymentAllocationId],
      foreignColumns: [
        supplierPaymentAllocations.organizationId,
        supplierPaymentAllocations.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_supplier_refund",
      columns: [t.organizationId, t.supplierRefundId],
      foreignColumns: [supplierRefunds.organizationId, supplierRefunds.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_purchase_expense",
      columns: [t.organizationId, t.purchaseExpenseId],
      foreignColumns: [purchaseExpenses.organizationId, purchaseExpenses.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_acquisition_expense_allocation",
      columns: [t.organizationId, t.acquisitionExpenseAllocationId],
      foreignColumns: [
        acquisitionExpenseAllocations.organizationId,
        acquisitionExpenseAllocations.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_customer",
      columns: [t.organizationId, t.customerId],
      foreignColumns: [customers.organizationId, customers.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_sale_expense",
      columns: [t.organizationId, t.saleExpenseId],
      foreignColumns: [saleExpenses.organizationId, saleExpenses.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_customer_payment",
      columns: [t.organizationId, t.customerPaymentId],
      foreignColumns: [customerPayments.organizationId, customerPayments.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_customer_payment_allocation",
      columns: [t.organizationId, t.customerPaymentAllocationId],
      foreignColumns: [
        customerPaymentAllocations.organizationId,
        customerPaymentAllocations.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_customer_refund",
      columns: [t.organizationId, t.customerRefundId],
      foreignColumns: [customerRefunds.organizationId, customerRefunds.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_return",
      columns: [t.organizationId, t.returnId],
      foreignColumns: [returns.organizationId, returns.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_return_item",
      columns: [t.organizationId, t.returnItemId],
      foreignColumns: [returnItems.organizationId, returnItems.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_retained_income",
      columns: [t.organizationId, t.retainedIncomeId],
      foreignColumns: [retainedIncome.organizationId, retainedIncome.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_retained_income_allocation",
      columns: [t.organizationId, t.retainedIncomeAllocationId],
      foreignColumns: [
        retainedIncomeAllocations.organizationId,
        retainedIncomeAllocations.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_loss",
      columns: [t.organizationId, t.lossId],
      foreignColumns: [losses.organizationId, losses.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_customer_settlement_id",
      columns: [t.organizationId, t.customerSettlementId],
      foreignColumns: [
        customerSettlements.organizationId,
        customerSettlements.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_customer_settlement_source_allocation_id",
      columns: [t.organizationId, t.customerSettlementSourceAllocationId],
      foreignColumns: [
        customerSettlementSourceAllocations.organizationId,
        customerSettlementSourceAllocations.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_supplier_settlement_id",
      columns: [t.organizationId, t.supplierSettlementId],
      foreignColumns: [
        supplierSettlements.organizationId,
        supplierSettlements.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_supplier_settlement_source_allocation_id",
      columns: [t.organizationId, t.supplierSettlementSourceAllocationId],
      foreignColumns: [
        supplierSettlementSourceAllocations.organizationId,
        supplierSettlementSourceAllocations.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_purchase_expense_payment",
      columns: [t.organizationId, t.purchaseExpensePaymentId],
      foreignColumns: [
        purchaseExpensePayments.organizationId,
        purchaseExpensePayments.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "change_sale_expense_payment",
      columns: [t.organizationId, t.saleExpensePaymentId],
      foreignColumns: [
        saleExpensePayments.organizationId,
        saleExpensePayments.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);
