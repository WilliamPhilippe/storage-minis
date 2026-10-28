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
import { customerSettlementOutcome } from "./enums.js";
import { organizations } from "./identity-and-access.js";
import { businessEvents } from "./losses-and-shared-history.js";
import { customers, returns, saleItems, sales } from "./sales-and-returns.js";

export const customerPayments = pgTable(
  "customer_payments",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    customerId: integer("customer_id").notNull(),
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
    check("customer_payments_positive_id", sql`${t.id} > 0`),
    check("customer_payments_positive_amount", sql`${t.amount} > 0`),
    index("customer_payments_organization_idx").on(t.organizationId),
    unique("customer_payments_key_1").on(t.organizationId, t.customerId, t.id),
    unique("customer_payments_key_2").on(t.organizationId, t.id),
    foreignKey({
      name: "owner_customer_payments",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "customer_payment_party",
      columns: [t.organizationId, t.customerId],
      foreignColumns: [customers.organizationId, customers.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_customer_payments",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const customerPaymentAllocations = pgTable(
  "customer_payment_allocations",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    customerId: integer("customer_id").notNull(),
    customerPaymentId: integer("customer_payment_id").notNull(),
    saleId: integer("sale_id").notNull(),
    saleItemId: integer("sale_item_id").notNull(),
    amount: integer("amount").notNull(),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("customer_payment_allocations_positive_id", sql`${t.id} > 0`),
    check("customer_payment_allocations_positive_amount", sql`${t.amount} > 0`),
    index("customer_payment_allocations_organization_idx").on(t.organizationId),
    unique("customer_payment_allocations_key_1").on(t.organizationId, t.id),
    foreignKey({
      name: "owner_customer_payment_allocations",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "customer_allocation_payment_party",
      columns: [t.organizationId, t.customerId, t.customerPaymentId],
      foreignColumns: [
        customerPayments.organizationId,
        customerPayments.customerId,
        customerPayments.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "customer_allocation_sale_party",
      columns: [t.organizationId, t.customerId, t.saleId],
      foreignColumns: [sales.organizationId, sales.customerId, sales.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "customer_allocation_sale_line",
      columns: [t.organizationId, t.saleId, t.saleItemId],
      foreignColumns: [
        saleItems.organizationId,
        saleItems.saleId,
        saleItems.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_customer_payment_allocations",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const customerRefunds = pgTable(
  "customer_refunds",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    customerId: integer("customer_id").notNull(),
    saleId: integer("sale_id").notNull(),
    settlementId: integer("settlement_id").notNull(),
    amount: integer("amount").notNull(),
    refundedOn: timestamp("refunded_on", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }).notNull(),
    method: text("method").notNull(),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("customer_refunds_positive_id", sql`${t.id} > 0`),
    check("customer_refunds_positive_amount", sql`${t.amount} > 0`),
    index("customer_refunds_organization_idx").on(t.organizationId),
    unique("customer_refunds_key_1").on(t.organizationId, t.id),
    foreignKey({
      name: "owner_customer_refunds",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "customer_refund_sale_party",
      columns: [t.organizationId, t.customerId, t.saleId],
      foreignColumns: [sales.organizationId, sales.customerId, sales.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_customer_refunds",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "customer_refund_settlement_sale_party",
      columns: [t.organizationId, t.customerId, t.saleId, t.settlementId],
      foreignColumns: [
        customerSettlements.organizationId,
        customerSettlements.customerId,
        customerSettlements.saleId,
        customerSettlements.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const retainedIncome = pgTable(
  "retained_income",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    saleId: integer("sale_id").notNull(),
    settlementId: integer("settlement_id").notNull(),
    amount: integer("amount").notNull(),
    recognizedOn: timestamp("recognized_on", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }).notNull(),
    reason: text("reason").notNull(),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("retained_income_positive_id", sql`${t.id} > 0`),
    check("retained_income_positive_amount", sql`${t.amount} > 0`),
    index("retained_income_organization_idx").on(t.organizationId),
    unique("retained_income_key_1").on(t.organizationId, t.saleId, t.id),
    unique("retained_income_key_2").on(t.organizationId, t.id),
    foreignKey({
      name: "owner_retained_income",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "retained_income_sale",
      columns: [t.organizationId, t.saleId],
      foreignColumns: [sales.organizationId, sales.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_retained_income",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "retained_income_settlement_sale",
      columns: [t.organizationId, t.saleId, t.settlementId],
      foreignColumns: [
        customerSettlements.organizationId,
        customerSettlements.saleId,
        customerSettlements.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const retainedIncomeAllocations = pgTable(
  "retained_income_allocations",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    retainedIncomeId: integer("retained_income_id").notNull(),
    saleId: integer("sale_id").notNull(),
    saleItemId: integer("sale_item_id").notNull(),
    amount: integer("amount").notNull(),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("retained_income_allocations_positive_id", sql`${t.id} > 0`),
    check("retained_income_allocations_positive_amount", sql`${t.amount} > 0`),
    index("retained_income_allocations_organization_idx").on(t.organizationId),
    unique("retained_income_allocations_key_1").on(t.organizationId, t.id),
    foreignKey({
      name: "owner_retained_income_allocations",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "retained_allocation_income_sale",
      columns: [t.organizationId, t.saleId, t.retainedIncomeId],
      foreignColumns: [
        retainedIncome.organizationId,
        retainedIncome.saleId,
        retainedIncome.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "retained_allocation_affected_sale_line",
      columns: [t.organizationId, t.saleId, t.saleItemId],
      foreignColumns: [
        saleItems.organizationId,
        saleItems.saleId,
        saleItems.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_retained_income_allocations",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const customerSettlements = pgTable(
  "customer_settlements",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    customerId: integer("customer_id").notNull(),
    saleId: integer("sale_id").notNull(),
    returnId: integer("return_id"),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check("customer_settlements_positive_id", sql`${t.id} > 0`),
    index("customer_settlements_organization_idx").on(t.organizationId),
    unique("customer_settlements_key_1").on(t.organizationId, t.id),
    unique("customer_settlements_key_2").on(
      t.organizationId,
      t.customerId,
      t.saleId,
      t.id,
    ),
    unique("customer_settlements_key_3").on(t.organizationId, t.saleId, t.id),
    foreignKey({
      name: "owner_customer_settlements",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "customer_settlement_customer",
      columns: [t.organizationId, t.customerId],
      foreignColumns: [customers.organizationId, customers.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "customer_settlement_sale",
      columns: [t.organizationId, t.customerId, t.saleId],
      foreignColumns: [sales.organizationId, sales.customerId, sales.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "customer_settlement_return",
      columns: [t.organizationId, t.saleId, t.returnId],
      foreignColumns: [returns.organizationId, returns.saleId, returns.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_customer_settlements",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);

export const customerSettlementSourceAllocations = pgTable(
  "customer_settlement_source_allocations",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    organizationId: integer("organization_id").notNull(),
    settlementId: integer("settlement_id").notNull(),
    sourceCustomerPaymentAllocationId: integer(
      "source_customer_payment_allocation_id",
    ).notNull(),
    amount: integer("amount").notNull(),
    outcome: customerSettlementOutcome("outcome").notNull(),
    customerRefundId: integer("customer_refund_id"),
    targetCustomerPaymentAllocationId: integer(
      "target_customer_payment_allocation_id",
    ),
    retainedIncomeId: integer("retained_income_id"),
    createdEventId: integer("created_event_id").notNull(),
  },
  (t): PgTableExtraConfigValue[] => [
    check(
      "customer_settlement_source_allocations_positive_id",
      sql`${t.id} > 0`,
    ),
    check("positive_customer_settlement_portion", sql`amount > 0`),
    check(
      "one_customer_settlement_outcome",
      sql`((outcome = 'refund' AND target_customer_payment_allocation_id IS NULL AND retained_income_id IS NULL) OR (outcome = 'reassignment' AND target_customer_payment_allocation_id IS NOT NULL AND customer_refund_id IS NULL AND retained_income_id IS NULL) OR (outcome = 'retained_income' AND retained_income_id IS NOT NULL AND customer_refund_id IS NULL AND target_customer_payment_allocation_id IS NULL))`,
    ),
    index("customer_settlement_source_allocations_organization_idx").on(
      t.organizationId,
    ),
    unique("customer_settlement_source_allocations_key_1").on(
      t.organizationId,
      t.id,
    ),
    foreignKey({
      name: "owner_customer_settlement_sources",
      columns: [t.organizationId],
      foreignColumns: [organizations.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "customer_settlement_source_header",
      columns: [t.organizationId, t.settlementId],
      foreignColumns: [
        customerSettlements.organizationId,
        customerSettlements.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "customer_settlement_source_payment",
      columns: [t.organizationId, t.sourceCustomerPaymentAllocationId],
      foreignColumns: [
        customerPaymentAllocations.organizationId,
        customerPaymentAllocations.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "customer_settlement_source_refund",
      columns: [t.organizationId, t.customerRefundId],
      foreignColumns: [customerRefunds.organizationId, customerRefunds.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "customer_settlement_source_target",
      columns: [t.organizationId, t.targetCustomerPaymentAllocationId],
      foreignColumns: [
        customerPaymentAllocations.organizationId,
        customerPaymentAllocations.id,
      ],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "customer_settlement_source_retention",
      columns: [t.organizationId, t.retainedIncomeId],
      foreignColumns: [retainedIncome.organizationId, retainedIncome.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
    foreignKey({
      name: "created_customer_settlement_source_allocations",
      columns: [t.organizationId, t.createdEventId],
      foreignColumns: [businessEvents.organizationId, businessEvents.id],
    })
      .onDelete("restrict")
      .onUpdate("no action"),
  ],
);
