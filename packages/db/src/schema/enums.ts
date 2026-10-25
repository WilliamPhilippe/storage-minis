import { pgEnum } from "drizzle-orm/pg-core";

export const supplierType = pgEnum("supplier_type", ["person", "business"]);

export const inventoryStatus = pgEnum("inventory_status", [
  "china",
  "brasil",
  "eua",
  "bolivia",
  "shipped",
  "received",
]);

export const saleStatus = pgEnum("sale_status", [
  "unapproved",
  "available",
  "held",
  "collection",
]);

export const purchaseLifecycle = pgEnum("purchase_lifecycle", [
  "open",
  "completed",
  "canceled",
]);

export const expenseCompleteness = pgEnum("expense_completeness", [
  "unknown",
  "confirmed_zero",
  "accounted_for",
]);

export const acquisitionAllocationMethod = pgEnum(
  "acquisition_allocation_method",
  ["proportional_to_value", "equal_per_unit", "manual"],
);

export const businessEventScope = pgEnum("business_event_scope", [
  "organization",
  "global_product",
]);

export const customerSettlementOutcome = pgEnum("customer_settlement_outcome", [
  "refund",
  "reassignment",
  "retained_income",
]);

export const supplierSettlementOutcome = pgEnum("supplier_settlement_outcome", [
  "refund",
  "reassignment",
  "loss",
]);

export const membershipRole = pgEnum("membership_role", [
  "owner",
  "editor",
  "viewer",
]);

export const userRole = pgEnum("user_role", ["global_admin", "editor", "user"]);
