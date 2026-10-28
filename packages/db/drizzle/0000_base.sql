-- S04, approved 2026-10-25: integer identity -> unpadded uppercase base36.
-- Drizzle Kit 0.31.11 does not manage functions. Keep this dependency before
-- inventory_items; subsequent schema generation retains its generated expression.
CREATE FUNCTION public.inventory_id_base36(value integer) RETURNS text
LANGUAGE plpgsql IMMUTABLE STRICT PARALLEL SAFE
AS $function$
DECLARE
  remaining integer := value;
  encoded text := '';
BEGIN
  IF remaining <= 0 THEN
    RAISE EXCEPTION 'Inventory identity must be positive' USING ERRCODE = '22023';
  END IF;
  LOOP
    encoded := pg_catalog.substr('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', (remaining % 36) + 1, 1) || encoded;
    remaining := remaining / 36;
    EXIT WHEN remaining = 0;
  END LOOP;
  RETURN encoded;
END;
$function$;
--> statement-breakpoint
CREATE TYPE "public"."acquisition_allocation_method" AS ENUM('proportional_to_value', 'equal_per_unit', 'manual');--> statement-breakpoint
CREATE TYPE "public"."business_event_scope" AS ENUM('organization', 'global_product');--> statement-breakpoint
CREATE TYPE "public"."customer_settlement_outcome" AS ENUM('refund', 'reassignment', 'retained_income');--> statement-breakpoint
CREATE TYPE "public"."expense_completeness" AS ENUM('unknown', 'confirmed_zero', 'accounted_for');--> statement-breakpoint
CREATE TYPE "public"."inventory_status" AS ENUM('china', 'brasil', 'eua', 'bolivia', 'shipped', 'received');--> statement-breakpoint
CREATE TYPE "public"."membership_role" AS ENUM('owner', 'editor', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."purchase_lifecycle" AS ENUM('open', 'completed', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."sale_status" AS ENUM('unapproved', 'available', 'held', 'collection');--> statement-breakpoint
CREATE TYPE "public"."supplier_settlement_outcome" AS ENUM('refund', 'reassignment', 'loss');--> statement-breakpoint
CREATE TYPE "public"."supplier_type" AS ENUM('person', 'business');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('global_admin', 'editor', 'user');--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "memberships_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"granted_at" timestamp (3) with time zone NOT NULL,
	"role" "membership_role" NOT NULL,
	CONSTRAINT "memberships_key_1" UNIQUE("organization_id","user_id"),
	CONSTRAINT "memberships_positive_id" CHECK ("memberships"."id" > 0)
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "organizations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_positive_id" CHECK ("organizations"."id" > 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"firebase_uid" text NOT NULL,
	"email" text,
	"display_name" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"can_edit_products" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_key_1" UNIQUE("firebase_uid"),
	CONSTRAINT "users_positive_id" CHECK ("users"."id" > 0)
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "inventory_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"inventoryId" text GENERATED ALWAYS AS (public.inventory_id_base36(id)) STORED NOT NULL,
	"organization_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"purchase_id" integer NOT NULL,
	"purchase_item_id" integer NOT NULL,
	"merchandise_cost" integer,
	"sealed" boolean,
	"damaged" boolean,
	"damage_description" text,
	"private_notes" text,
	"asking_price" integer,
	"status" "inventory_status" NOT NULL,
	"sale_status" "sale_status" DEFAULT 'unapproved' NOT NULL,
	"first_received_event_id" integer,
	"first_sale_approval_event_id" integer,
	"removed_event_id" integer,
	"acquisition_expense_completeness" "expense_completeness" DEFAULT 'unknown' NOT NULL,
	"finalized_acquisition_cost" integer,
	"cost_finalized_event_id" integer,
	"created_event_id" integer NOT NULL,
	"public_description" text,
	"public_images" text[],
	CONSTRAINT "inventory_items_key_1" UNIQUE("organization_id","purchase_id","id"),
	CONSTRAINT "inventory_items_key_2" UNIQUE("organization_id","id"),
	CONSTRAINT "inventory_items_key_3" UNIQUE("organization_id","inventoryId"),
	CONSTRAINT "inventory_items_positive_id" CHECK ("inventory_items"."id" > 0),
	CONSTRAINT "cost_snapshot_has_event" CHECK (((finalized_acquisition_cost IS NULL) = (cost_finalized_event_id IS NULL))),
	CONSTRAINT "inventory_items_merchandise_cost_nonnegative" CHECK ("inventory_items"."merchandise_cost" >= 0),
	CONSTRAINT "inventory_items_asking_price_nonnegative" CHECK ("inventory_items"."asking_price" >= 0),
	CONSTRAINT "inventory_items_finalized_acquisition_cost_nonnegative" CHECK ("inventory_items"."finalized_acquisition_cost" >= 0)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"sku" text NOT NULL,
	"brand" text NOT NULL,
	"description" text,
	"images" text[],
	"is_chase" boolean DEFAULT false NOT NULL,
	"registration_event_id" integer NOT NULL,
	"registration_scope" integer GENERATED ALWAYS AS (0) STORED NOT NULL,
	CONSTRAINT "products_positive_id" CHECK ("products"."id" > 0)
);
--> statement-breakpoint
CREATE TABLE "purchase_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "purchase_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"purchase_id" integer NOT NULL,
	"ordered_quantity" integer NOT NULL,
	"merchandise_total" integer,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "purchase_items_key_1" UNIQUE("organization_id","purchase_id","id"),
	CONSTRAINT "purchase_items_key_2" UNIQUE("organization_id","id"),
	CONSTRAINT "purchase_items_positive_id" CHECK ("purchase_items"."id" > 0),
	CONSTRAINT "positive_ordered_quantity" CHECK (ordered_quantity > 0),
	CONSTRAINT "purchase_items_merchandise_total_nonnegative" CHECK ("purchase_items"."merchandise_total" >= 0)
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "purchases_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"supplier_id" integer NOT NULL,
	"ordered_on" timestamp (3) with time zone NOT NULL,
	"is_opening" boolean DEFAULT false NOT NULL,
	"opening_month" varchar(7),
	"opening_source_description" text,
	"opening_evidence" jsonb,
	"lifecycle" "purchase_lifecycle" DEFAULT 'open' NOT NULL,
	"expense_completeness" "expense_completeness" DEFAULT 'unknown' NOT NULL,
	"expenses_confirmed_event_id" integer,
	"incoming_shipping_notes" text,
	"completed_event_id" integer,
	"canceled_event_id" integer,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "purchases_key_1" UNIQUE("organization_id","id"),
	CONSTRAINT "purchases_key_2" UNIQUE("organization_id","supplier_id","id"),
	CONSTRAINT "purchases_positive_id" CHECK ("purchases"."id" > 0),
	CONSTRAINT "opening_purchase_has_month" CHECK (((opening_month IS NOT NULL) = is_opening)),
	CONSTRAINT "valid_opening_month" CHECK ((opening_month IS NULL OR (opening_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$' AND left(opening_month, 4) <> '0000'))),
	CONSTRAINT "opening_purchase_uses_second_day" CHECK ((NOT is_opening OR ordered_on = (opening_month || '-02T00:00:00Z')::timestamptz))
);
--> statement-breakpoint
CREATE TABLE "supplier_payment_allocations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "supplier_payment_allocations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"supplier_id" integer NOT NULL,
	"supplier_payment_id" integer NOT NULL,
	"purchase_id" integer NOT NULL,
	"inventory_item_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "supplier_payment_allocations_key_1" UNIQUE("organization_id","id"),
	CONSTRAINT "supplier_payment_allocations_positive_id" CHECK ("supplier_payment_allocations"."id" > 0),
	CONSTRAINT "supplier_payment_allocations_positive_amount" CHECK ("supplier_payment_allocations"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "supplier_payments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "supplier_payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"supplier_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"paid_on" timestamp (3) with time zone NOT NULL,
	"method" text NOT NULL,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "supplier_payments_key_1" UNIQUE("organization_id","supplier_id","id"),
	CONSTRAINT "supplier_payments_key_2" UNIQUE("organization_id","id"),
	CONSTRAINT "supplier_payments_positive_id" CHECK ("supplier_payments"."id" > 0),
	CONSTRAINT "supplier_payments_positive_amount" CHECK ("supplier_payments"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "supplier_refunds" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "supplier_refunds_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"supplier_id" integer NOT NULL,
	"settlement_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"received_on" timestamp (3) with time zone NOT NULL,
	"method" text NOT NULL,
	"related_loss_id" integer,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "supplier_refunds_key_1" UNIQUE("organization_id","id"),
	CONSTRAINT "supplier_refunds_positive_id" CHECK ("supplier_refunds"."id" > 0),
	CONSTRAINT "supplier_refunds_positive_amount" CHECK ("supplier_refunds"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "supplier_settlement_source_allocations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "supplier_settlement_source_allocations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"settlement_id" integer NOT NULL,
	"source_supplier_payment_allocation_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"outcome" "supplier_settlement_outcome" NOT NULL,
	"supplier_refund_id" integer,
	"target_supplier_payment_allocation_id" integer,
	"loss_id" integer,
	"related_prior_loss_id" integer,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "supplier_settlement_source_allocations_key_1" UNIQUE("organization_id","id"),
	CONSTRAINT "supplier_settlement_source_allocations_positive_id" CHECK ("supplier_settlement_source_allocations"."id" > 0),
	CONSTRAINT "positive_supplier_settlement_portion" CHECK (amount > 0),
	CONSTRAINT "one_supplier_settlement_outcome" CHECK (((outcome = 'refund' AND target_supplier_payment_allocation_id IS NULL AND loss_id IS NULL) OR (outcome = 'reassignment' AND target_supplier_payment_allocation_id IS NOT NULL AND supplier_refund_id IS NULL AND loss_id IS NULL) OR (outcome = 'loss' AND loss_id IS NOT NULL AND supplier_refund_id IS NULL AND target_supplier_payment_allocation_id IS NULL)))
);
--> statement-breakpoint
CREATE TABLE "supplier_settlements" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "supplier_settlements_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"supplier_id" integer NOT NULL,
	"purchase_id" integer,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "supplier_settlements_key_1" UNIQUE("organization_id","id"),
	CONSTRAINT "supplier_settlements_key_2" UNIQUE("organization_id","supplier_id","id"),
	CONSTRAINT "supplier_settlements_positive_id" CHECK ("supplier_settlements"."id" > 0)
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "suppliers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"type" "supplier_type",
	"is_unknown" boolean DEFAULT false NOT NULL,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "suppliers_key_1" UNIQUE("organization_id","id"),
	CONSTRAINT "suppliers_positive_id" CHECK ("suppliers"."id" > 0),
	CONSTRAINT "known_supplier_has_contact_and_type" CHECK ((is_unknown OR (phone IS NOT NULL AND type IS NOT NULL))),
	CONSTRAINT "unknown_supplier_has_no_fabricated_details" CHECK ((NOT is_unknown OR (phone IS NULL AND type IS NULL)))
);
--> statement-breakpoint
CREATE TABLE "acquisition_expense_allocations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "acquisition_expense_allocations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"purchase_expense_id" integer NOT NULL,
	"purchase_id" integer NOT NULL,
	"inventory_item_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "acquisition_expense_allocations_key_1" UNIQUE("organization_id","id"),
	CONSTRAINT "acquisition_expense_allocations_key_2" UNIQUE("organization_id","purchase_expense_id","inventory_item_id"),
	CONSTRAINT "acquisition_expense_allocations_positive_id" CHECK ("acquisition_expense_allocations"."id" > 0),
	CONSTRAINT "acquisition_expense_allocations_amount_nonnegative" CHECK ("acquisition_expense_allocations"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "purchase_expense_payments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "purchase_expense_payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"purchase_expense_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"paid_on" timestamp (3) with time zone NOT NULL,
	"method" text NOT NULL,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "purchase_expense_payments_key_1" UNIQUE("organization_id","id"),
	CONSTRAINT "purchase_expense_payments_positive_id" CHECK ("purchase_expense_payments"."id" > 0),
	CONSTRAINT "positive_purchase_expense_payment" CHECK (amount > 0)
);
--> statement-breakpoint
CREATE TABLE "purchase_expenses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "purchase_expenses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"incurred_on" timestamp (3) with time zone NOT NULL,
	"category" text NOT NULL,
	"context" text,
	"allocation_method" "acquisition_allocation_method" DEFAULT 'proportional_to_value' NOT NULL,
	"settled_amount" integer DEFAULT 0 NOT NULL,
	"settled_on" timestamp (3) with time zone,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "purchase_expenses_key_1" UNIQUE("organization_id","id"),
	CONSTRAINT "purchase_expenses_positive_id" CHECK ("purchase_expenses"."id" > 0),
	CONSTRAINT "positive_purchase_expense" CHECK (amount > 0),
	CONSTRAINT "purchase_expense_payment_bounds" CHECK ((settled_amount >= 0 AND settled_amount <= amount)),
	CONSTRAINT "purchase_expense_fully_paid_timestamp" CHECK (((settled_on IS NOT NULL) = (settled_amount = amount)))
);
--> statement-breakpoint
CREATE TABLE "sale_expense_payments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sale_expense_payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"sale_expense_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"paid_on" timestamp (3) with time zone NOT NULL,
	"method" text NOT NULL,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "sale_expense_payments_key_1" UNIQUE("organization_id","id"),
	CONSTRAINT "sale_expense_payments_positive_id" CHECK ("sale_expense_payments"."id" > 0),
	CONSTRAINT "positive_sale_expense_payment" CHECK (amount > 0)
);
--> statement-breakpoint
CREATE TABLE "sale_expenses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sale_expenses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"sale_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"incurred_on" timestamp (3) with time zone NOT NULL,
	"category" text NOT NULL,
	"context" text,
	"settled_amount" integer DEFAULT 0 NOT NULL,
	"settled_on" timestamp (3) with time zone,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "sale_expenses_key_1" UNIQUE("organization_id","id"),
	CONSTRAINT "sale_expenses_positive_id" CHECK ("sale_expenses"."id" > 0),
	CONSTRAINT "positive_sale_expense" CHECK (amount > 0),
	CONSTRAINT "sale_expense_payment_bounds" CHECK ((settled_amount >= 0 AND settled_amount <= amount)),
	CONSTRAINT "sale_expense_fully_paid_timestamp" CHECK (((settled_on IS NOT NULL) = (settled_amount = amount)))
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "customers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"address_line_1" text,
	"address_line_2" text,
	"address_neighborhood" text,
	"address_city" text,
	"address_region" text,
	"address_postal_code" text,
	"address_country" text,
	"notes" text,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "customers_key_1" UNIQUE("organization_id","id"),
	CONSTRAINT "customers_positive_id" CHECK ("customers"."id" > 0),
	CONSTRAINT "customer_nonblank_name" CHECK (length(btrim("customers"."name")) > 0)
);
--> statement-breakpoint
CREATE TABLE "return_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "return_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"return_id" integer NOT NULL,
	"sale_id" integer NOT NULL,
	"sale_item_id" integer NOT NULL,
	"sealed" boolean,
	"damaged" boolean,
	"damage_description" text,
	"approved_for_sale" boolean NOT NULL,
	"condition_notes" text,
	CONSTRAINT "return_items_key_1" UNIQUE("organization_id","id"),
	CONSTRAINT "return_items_key_2" UNIQUE("organization_id","sale_item_id"),
	CONSTRAINT "return_items_positive_id" CHECK ("return_items"."id" > 0)
);
--> statement-breakpoint
CREATE TABLE "returns" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "returns_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"sale_id" integer NOT NULL,
	"received_on" timestamp (3) with time zone NOT NULL,
	"reason" text,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "returns_key_1" UNIQUE("organization_id","sale_id","id"),
	CONSTRAINT "returns_key_2" UNIQUE("organization_id","id"),
	CONSTRAINT "returns_positive_id" CHECK ("returns"."id" > 0)
);
--> statement-breakpoint
CREATE TABLE "sale_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sale_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"sale_id" integer NOT NULL,
	"inventory_item_id" integer NOT NULL,
	"agreed_price" integer NOT NULL,
	"recognized_acquisition_cost" integer NOT NULL,
	"released_event_id" integer,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "sale_items_key_1" UNIQUE("organization_id","sale_id","id"),
	CONSTRAINT "sale_items_positive_id" CHECK ("sale_items"."id" > 0),
	CONSTRAINT "sale_items_agreed_price_nonnegative" CHECK ("sale_items"."agreed_price" >= 0),
	CONSTRAINT "sale_items_recognized_acquisition_cost_nonnegative" CHECK ("sale_items"."recognized_acquisition_cost" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sales_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"sold_on" timestamp (3) with time zone NOT NULL,
	"dispatched_on" timestamp (3) with time zone,
	"dispatch_event_id" integer,
	"tracking_code" text,
	"canceled_event_id" integer,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "sales_key_1" UNIQUE("organization_id","id"),
	CONSTRAINT "sales_key_2" UNIQUE("organization_id","customer_id","id"),
	CONSTRAINT "sales_positive_id" CHECK ("sales"."id" > 0),
	CONSTRAINT "dispatch_has_date_and_event" CHECK (((dispatched_on IS NULL) = (dispatch_event_id IS NULL))),
	CONSTRAINT "ordinary_cancellation_before_dispatch" CHECK ((canceled_event_id IS NULL OR dispatch_event_id IS NULL))
);
--> statement-breakpoint
CREATE TABLE "customer_payment_allocations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "customer_payment_allocations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"customer_payment_id" integer NOT NULL,
	"sale_id" integer NOT NULL,
	"sale_item_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "customer_payment_allocations_key_1" UNIQUE("organization_id","id"),
	CONSTRAINT "customer_payment_allocations_positive_id" CHECK ("customer_payment_allocations"."id" > 0),
	CONSTRAINT "customer_payment_allocations_positive_amount" CHECK ("customer_payment_allocations"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "customer_payments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "customer_payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"paid_on" timestamp (3) with time zone NOT NULL,
	"method" text NOT NULL,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "customer_payments_key_1" UNIQUE("organization_id","customer_id","id"),
	CONSTRAINT "customer_payments_key_2" UNIQUE("organization_id","id"),
	CONSTRAINT "customer_payments_positive_id" CHECK ("customer_payments"."id" > 0),
	CONSTRAINT "customer_payments_positive_amount" CHECK ("customer_payments"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "customer_refunds" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "customer_refunds_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"sale_id" integer NOT NULL,
	"settlement_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"refunded_on" timestamp (3) with time zone NOT NULL,
	"method" text NOT NULL,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "customer_refunds_key_1" UNIQUE("organization_id","id"),
	CONSTRAINT "customer_refunds_positive_id" CHECK ("customer_refunds"."id" > 0),
	CONSTRAINT "customer_refunds_positive_amount" CHECK ("customer_refunds"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "customer_settlement_source_allocations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "customer_settlement_source_allocations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"settlement_id" integer NOT NULL,
	"source_customer_payment_allocation_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"outcome" "customer_settlement_outcome" NOT NULL,
	"customer_refund_id" integer,
	"target_customer_payment_allocation_id" integer,
	"retained_income_id" integer,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "customer_settlement_source_allocations_key_1" UNIQUE("organization_id","id"),
	CONSTRAINT "customer_settlement_source_allocations_positive_id" CHECK ("customer_settlement_source_allocations"."id" > 0),
	CONSTRAINT "positive_customer_settlement_portion" CHECK (amount > 0),
	CONSTRAINT "one_customer_settlement_outcome" CHECK (((outcome = 'refund' AND target_customer_payment_allocation_id IS NULL AND retained_income_id IS NULL) OR (outcome = 'reassignment' AND target_customer_payment_allocation_id IS NOT NULL AND customer_refund_id IS NULL AND retained_income_id IS NULL) OR (outcome = 'retained_income' AND retained_income_id IS NOT NULL AND customer_refund_id IS NULL AND target_customer_payment_allocation_id IS NULL)))
);
--> statement-breakpoint
CREATE TABLE "customer_settlements" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "customer_settlements_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"sale_id" integer NOT NULL,
	"return_id" integer,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "customer_settlements_key_1" UNIQUE("organization_id","id"),
	CONSTRAINT "customer_settlements_key_2" UNIQUE("organization_id","customer_id","sale_id","id"),
	CONSTRAINT "customer_settlements_key_3" UNIQUE("organization_id","sale_id","id"),
	CONSTRAINT "customer_settlements_positive_id" CHECK ("customer_settlements"."id" > 0)
);
--> statement-breakpoint
CREATE TABLE "retained_income" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "retained_income_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"sale_id" integer NOT NULL,
	"settlement_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"recognized_on" timestamp (3) with time zone NOT NULL,
	"reason" text NOT NULL,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "retained_income_key_1" UNIQUE("organization_id","sale_id","id"),
	CONSTRAINT "retained_income_key_2" UNIQUE("organization_id","id"),
	CONSTRAINT "retained_income_positive_id" CHECK ("retained_income"."id" > 0),
	CONSTRAINT "retained_income_positive_amount" CHECK ("retained_income"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "retained_income_allocations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "retained_income_allocations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"retained_income_id" integer NOT NULL,
	"sale_id" integer NOT NULL,
	"sale_item_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "retained_income_allocations_key_1" UNIQUE("organization_id","id"),
	CONSTRAINT "retained_income_allocations_positive_id" CHECK ("retained_income_allocations"."id" > 0),
	CONSTRAINT "retained_income_allocations_positive_amount" CHECK ("retained_income_allocations"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "business_event_changes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "business_event_changes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"business_event_id" integer NOT NULL,
	"organization_id" integer,
	"sequence" integer NOT NULL,
	"change_kind" text NOT NULL,
	"product_id" integer,
	"membership_user_id" integer,
	"inventory_item_id" integer,
	"supplier_id" integer,
	"purchase_id" integer,
	"purchase_item_id" integer,
	"supplier_payment_id" integer,
	"supplier_payment_allocation_id" integer,
	"supplier_refund_id" integer,
	"purchase_expense_id" integer,
	"purchase_expense_payment_id" integer,
	"acquisition_expense_allocation_id" integer,
	"customer_id" integer,
	"sale_id" integer,
	"sale_item_id" integer,
	"sale_expense_id" integer,
	"sale_expense_payment_id" integer,
	"customer_payment_id" integer,
	"customer_payment_allocation_id" integer,
	"customer_refund_id" integer,
	"return_id" integer,
	"return_item_id" integer,
	"retained_income_id" integer,
	"retained_income_allocation_id" integer,
	"loss_id" integer,
	"customer_settlement_id" integer,
	"customer_settlement_source_allocation_id" integer,
	"supplier_settlement_id" integer,
	"supplier_settlement_source_allocation_id" integer,
	"before_facts" jsonb,
	"after_facts" jsonb,
	"reverses_change_id" integer,
	"scope_organization_id" integer GENERATED ALWAYS AS (coalesce(organization_id, 0)) STORED NOT NULL,
	CONSTRAINT "business_event_changes_key_1" UNIQUE("scope_organization_id","id"),
	CONSTRAINT "business_event_changes_key_2" UNIQUE("business_event_id","sequence"),
	CONSTRAINT "business_event_changes_positive_id" CHECK ("business_event_changes"."id" > 0),
	CONSTRAINT "one_typed_business_subject" CHECK (num_nonnulls(product_id, membership_user_id, inventory_item_id, supplier_id, purchase_id, purchase_item_id, supplier_payment_id, supplier_payment_allocation_id, supplier_refund_id, purchase_expense_id, purchase_expense_payment_id, acquisition_expense_allocation_id, customer_id, sale_id, sale_item_id, sale_expense_id, sale_expense_payment_id, customer_payment_id, customer_payment_allocation_id, customer_refund_id, return_id, return_item_id, retained_income_id, retained_income_allocation_id, loss_id, customer_settlement_id, customer_settlement_source_allocation_id, supplier_settlement_id, supplier_settlement_source_allocation_id) = 1),
	CONSTRAINT "change_subject_matches_scope" CHECK (((organization_id IS NULL AND product_id IS NOT NULL) OR (organization_id IS NOT NULL AND product_id IS NULL))),
	CONSTRAINT "preserved_business_facts" CHECK ((before_facts IS NOT NULL OR after_facts IS NOT NULL)),
	CONSTRAINT "positive_change_sequence" CHECK (sequence > 0)
);
--> statement-breakpoint
CREATE TABLE "business_events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "business_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"scope" "business_event_scope" NOT NULL,
	"organization_id" integer,
	"context_organization_id" integer,
	"actor_user_id" integer NOT NULL,
	"action_type" text NOT NULL,
	"occurred_at" timestamp (3) with time zone NOT NULL,
	"recorded_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"reason" text,
	"reverses_event_id" integer,
	"scope_organization_id" integer GENERATED ALWAYS AS (coalesce(organization_id, 0)) STORED NOT NULL,
	CONSTRAINT "business_events_key_1" UNIQUE("scope_organization_id","id"),
	CONSTRAINT "business_events_key_2" UNIQUE("organization_id","id"),
	CONSTRAINT "business_events_key_3" UNIQUE("id","scope_organization_id"),
	CONSTRAINT "business_events_positive_id" CHECK ("business_events"."id" > 0),
	CONSTRAINT "business_event_scope_matches_owner" CHECK (((scope = 'organization' AND organization_id IS NOT NULL) OR (scope = 'global_product' AND organization_id IS NULL)))
);
--> statement-breakpoint
CREATE TABLE "losses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "losses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"inventory_item_id" integer,
	"purchase_id" integer,
	"sale_id" integer,
	"amount" integer NOT NULL,
	"occurred_on" timestamp (3) with time zone NOT NULL,
	"reason" text NOT NULL,
	"reversed_event_id" integer,
	"created_event_id" integer NOT NULL,
	CONSTRAINT "losses_key_1" UNIQUE("organization_id","id"),
	CONSTRAINT "losses_positive_id" CHECK ("losses"."id" > 0),
	CONSTRAINT "losses_amount_nonnegative" CHECK ("losses"."amount" >= 0)
);
--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "owner_memberships" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "membership_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "owner_inventory_items" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "unit_global_product" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "unit_purchase" FOREIGN KEY ("organization_id","purchase_id") REFERENCES "public"."purchases"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "unit_purchase_line" FOREIGN KEY ("organization_id","purchase_id","purchase_item_id") REFERENCES "public"."purchase_items"("organization_id","purchase_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "created_inventory_items" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_first_received" FOREIGN KEY ("organization_id","first_received_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_first_sale_approval" FOREIGN KEY ("organization_id","first_sale_approval_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_removed" FOREIGN KEY ("organization_id","removed_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_cost_finalized" FOREIGN KEY ("organization_id","cost_finalized_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "product_registration" FOREIGN KEY ("registration_event_id") REFERENCES "public"."business_events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "product_registration_global_scope" FOREIGN KEY ("registration_event_id","registration_scope") REFERENCES "public"."business_events"("id","scope_organization_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_items" ADD CONSTRAINT "owner_purchase_items" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_line_header" FOREIGN KEY ("organization_id","purchase_id") REFERENCES "public"."purchases"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_items" ADD CONSTRAINT "created_purchase_items" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "owner_purchases" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchase_supplier" FOREIGN KEY ("organization_id","supplier_id") REFERENCES "public"."suppliers"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "created_purchases" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_expenses_confirmed" FOREIGN KEY ("organization_id","expenses_confirmed_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_completed" FOREIGN KEY ("organization_id","completed_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_canceled" FOREIGN KEY ("organization_id","canceled_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_payment_allocations" ADD CONSTRAINT "owner_supplier_payment_allocations" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_payment_allocations" ADD CONSTRAINT "supplier_allocation_payment_party" FOREIGN KEY ("organization_id","supplier_id","supplier_payment_id") REFERENCES "public"."supplier_payments"("organization_id","supplier_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_payment_allocations" ADD CONSTRAINT "supplier_allocation_purchase_party" FOREIGN KEY ("organization_id","supplier_id","purchase_id") REFERENCES "public"."purchases"("organization_id","supplier_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_payment_allocations" ADD CONSTRAINT "supplier_allocation_unit_purchase" FOREIGN KEY ("organization_id","purchase_id","inventory_item_id") REFERENCES "public"."inventory_items"("organization_id","purchase_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_payment_allocations" ADD CONSTRAINT "created_supplier_payment_allocations" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_payments" ADD CONSTRAINT "owner_supplier_payments" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payment_party" FOREIGN KEY ("organization_id","supplier_id") REFERENCES "public"."suppliers"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_payments" ADD CONSTRAINT "created_supplier_payments" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_refunds" ADD CONSTRAINT "owner_supplier_refunds" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_refunds" ADD CONSTRAINT "supplier_refund_party" FOREIGN KEY ("organization_id","supplier_id") REFERENCES "public"."suppliers"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_refunds" ADD CONSTRAINT "supplier_refund_original_loss" FOREIGN KEY ("organization_id","related_loss_id") REFERENCES "public"."losses"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_refunds" ADD CONSTRAINT "created_supplier_refunds" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_refunds" ADD CONSTRAINT "supplier_refund_settlement_party" FOREIGN KEY ("organization_id","supplier_id","settlement_id") REFERENCES "public"."supplier_settlements"("organization_id","supplier_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_settlement_source_allocations" ADD CONSTRAINT "owner_supplier_settlement_sources" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_settlement_source_allocations" ADD CONSTRAINT "supplier_settlement_source_header" FOREIGN KEY ("organization_id","settlement_id") REFERENCES "public"."supplier_settlements"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_settlement_source_allocations" ADD CONSTRAINT "supplier_settlement_source_payment" FOREIGN KEY ("organization_id","source_supplier_payment_allocation_id") REFERENCES "public"."supplier_payment_allocations"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_settlement_source_allocations" ADD CONSTRAINT "supplier_settlement_source_refund" FOREIGN KEY ("organization_id","supplier_refund_id") REFERENCES "public"."supplier_refunds"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_settlement_source_allocations" ADD CONSTRAINT "supplier_settlement_source_target" FOREIGN KEY ("organization_id","target_supplier_payment_allocation_id") REFERENCES "public"."supplier_payment_allocations"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_settlement_source_allocations" ADD CONSTRAINT "supplier_settlement_source_loss" FOREIGN KEY ("organization_id","loss_id") REFERENCES "public"."losses"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_settlement_source_allocations" ADD CONSTRAINT "supplier_settlement_source_prior_loss" FOREIGN KEY ("organization_id","related_prior_loss_id") REFERENCES "public"."losses"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_settlement_source_allocations" ADD CONSTRAINT "created_supplier_settlement_source_allocations" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_settlements" ADD CONSTRAINT "owner_supplier_settlements" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_settlements" ADD CONSTRAINT "supplier_settlement_supplier" FOREIGN KEY ("organization_id","supplier_id") REFERENCES "public"."suppliers"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_settlements" ADD CONSTRAINT "supplier_settlement_purchase" FOREIGN KEY ("organization_id","supplier_id","purchase_id") REFERENCES "public"."purchases"("organization_id","supplier_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_settlements" ADD CONSTRAINT "created_supplier_settlements" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "owner_suppliers" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "created_suppliers" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acquisition_expense_allocations" ADD CONSTRAINT "owner_acquisition_expense_allocations" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acquisition_expense_allocations" ADD CONSTRAINT "expense_allocation_source" FOREIGN KEY ("organization_id","purchase_expense_id") REFERENCES "public"."purchase_expenses"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acquisition_expense_allocations" ADD CONSTRAINT "expense_allocation_unit_purchase" FOREIGN KEY ("organization_id","purchase_id","inventory_item_id") REFERENCES "public"."inventory_items"("organization_id","purchase_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acquisition_expense_allocations" ADD CONSTRAINT "created_acquisition_expense_allocations" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_expense_payments" ADD CONSTRAINT "owner_purchase_expense_payments" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_expense_payments" ADD CONSTRAINT "purchase_expense_payment_source" FOREIGN KEY ("organization_id","purchase_expense_id") REFERENCES "public"."purchase_expenses"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_expense_payments" ADD CONSTRAINT "created_purchase_expense_payments" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_expenses" ADD CONSTRAINT "owner_purchase_expenses" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_expenses" ADD CONSTRAINT "created_purchase_expenses" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_expense_payments" ADD CONSTRAINT "owner_sale_expense_payments" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_expense_payments" ADD CONSTRAINT "sale_expense_payment_source" FOREIGN KEY ("organization_id","sale_expense_id") REFERENCES "public"."sale_expenses"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_expense_payments" ADD CONSTRAINT "created_sale_expense_payments" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_expenses" ADD CONSTRAINT "owner_sale_expenses" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_expenses" ADD CONSTRAINT "selling_expense_sale" FOREIGN KEY ("organization_id","sale_id") REFERENCES "public"."sales"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_expenses" ADD CONSTRAINT "created_sale_expenses" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "owner_customers" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "created_customers" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_items" ADD CONSTRAINT "owner_return_items" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_items" ADD CONSTRAINT "return_line_header_sale" FOREIGN KEY ("organization_id","sale_id","return_id") REFERENCES "public"."returns"("organization_id","sale_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_items" ADD CONSTRAINT "return_line_original_sale_line" FOREIGN KEY ("organization_id","sale_id","sale_item_id") REFERENCES "public"."sale_items"("organization_id","sale_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "returns" ADD CONSTRAINT "owner_returns" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "returns" ADD CONSTRAINT "return_original_sale" FOREIGN KEY ("organization_id","sale_id") REFERENCES "public"."sales"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "returns" ADD CONSTRAINT "created_returns" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "owner_sale_items" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_line_header" FOREIGN KEY ("organization_id","sale_id") REFERENCES "public"."sales"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_line_unit" FOREIGN KEY ("organization_id","inventory_item_id") REFERENCES "public"."inventory_items"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "created_sale_items" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_released" FOREIGN KEY ("organization_id","released_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "owner_sales" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sale_customer" FOREIGN KEY ("organization_id","customer_id") REFERENCES "public"."customers"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "created_sales" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_dispatch" FOREIGN KEY ("organization_id","dispatch_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_canceled" FOREIGN KEY ("organization_id","canceled_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_payment_allocations" ADD CONSTRAINT "owner_customer_payment_allocations" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_payment_allocations" ADD CONSTRAINT "customer_allocation_payment_party" FOREIGN KEY ("organization_id","customer_id","customer_payment_id") REFERENCES "public"."customer_payments"("organization_id","customer_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_payment_allocations" ADD CONSTRAINT "customer_allocation_sale_party" FOREIGN KEY ("organization_id","customer_id","sale_id") REFERENCES "public"."sales"("organization_id","customer_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_payment_allocations" ADD CONSTRAINT "customer_allocation_sale_line" FOREIGN KEY ("organization_id","sale_id","sale_item_id") REFERENCES "public"."sale_items"("organization_id","sale_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_payment_allocations" ADD CONSTRAINT "created_customer_payment_allocations" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_payments" ADD CONSTRAINT "owner_customer_payments" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_payments" ADD CONSTRAINT "customer_payment_party" FOREIGN KEY ("organization_id","customer_id") REFERENCES "public"."customers"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_payments" ADD CONSTRAINT "created_customer_payments" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_refunds" ADD CONSTRAINT "owner_customer_refunds" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_refunds" ADD CONSTRAINT "customer_refund_sale_party" FOREIGN KEY ("organization_id","customer_id","sale_id") REFERENCES "public"."sales"("organization_id","customer_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_refunds" ADD CONSTRAINT "created_customer_refunds" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_refunds" ADD CONSTRAINT "customer_refund_settlement_sale_party" FOREIGN KEY ("organization_id","customer_id","sale_id","settlement_id") REFERENCES "public"."customer_settlements"("organization_id","customer_id","sale_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_settlement_source_allocations" ADD CONSTRAINT "owner_customer_settlement_sources" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_settlement_source_allocations" ADD CONSTRAINT "customer_settlement_source_header" FOREIGN KEY ("organization_id","settlement_id") REFERENCES "public"."customer_settlements"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_settlement_source_allocations" ADD CONSTRAINT "customer_settlement_source_payment" FOREIGN KEY ("organization_id","source_customer_payment_allocation_id") REFERENCES "public"."customer_payment_allocations"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_settlement_source_allocations" ADD CONSTRAINT "customer_settlement_source_refund" FOREIGN KEY ("organization_id","customer_refund_id") REFERENCES "public"."customer_refunds"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_settlement_source_allocations" ADD CONSTRAINT "customer_settlement_source_target" FOREIGN KEY ("organization_id","target_customer_payment_allocation_id") REFERENCES "public"."customer_payment_allocations"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_settlement_source_allocations" ADD CONSTRAINT "customer_settlement_source_retention" FOREIGN KEY ("organization_id","retained_income_id") REFERENCES "public"."retained_income"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_settlement_source_allocations" ADD CONSTRAINT "created_customer_settlement_source_allocations" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_settlements" ADD CONSTRAINT "owner_customer_settlements" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_settlements" ADD CONSTRAINT "customer_settlement_customer" FOREIGN KEY ("organization_id","customer_id") REFERENCES "public"."customers"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_settlements" ADD CONSTRAINT "customer_settlement_sale" FOREIGN KEY ("organization_id","customer_id","sale_id") REFERENCES "public"."sales"("organization_id","customer_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_settlements" ADD CONSTRAINT "customer_settlement_return" FOREIGN KEY ("organization_id","sale_id","return_id") REFERENCES "public"."returns"("organization_id","sale_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_settlements" ADD CONSTRAINT "created_customer_settlements" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retained_income" ADD CONSTRAINT "owner_retained_income" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retained_income" ADD CONSTRAINT "retained_income_sale" FOREIGN KEY ("organization_id","sale_id") REFERENCES "public"."sales"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retained_income" ADD CONSTRAINT "created_retained_income" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retained_income" ADD CONSTRAINT "retained_income_settlement_sale" FOREIGN KEY ("organization_id","sale_id","settlement_id") REFERENCES "public"."customer_settlements"("organization_id","sale_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retained_income_allocations" ADD CONSTRAINT "owner_retained_income_allocations" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retained_income_allocations" ADD CONSTRAINT "retained_allocation_income_sale" FOREIGN KEY ("organization_id","sale_id","retained_income_id") REFERENCES "public"."retained_income"("organization_id","sale_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retained_income_allocations" ADD CONSTRAINT "retained_allocation_affected_sale_line" FOREIGN KEY ("organization_id","sale_id","sale_item_id") REFERENCES "public"."sale_items"("organization_id","sale_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retained_income_allocations" ADD CONSTRAINT "created_retained_income_allocations" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "owner_business_event_changes" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_event_identity" FOREIGN KEY ("business_event_id") REFERENCES "public"."business_events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_event_owner" FOREIGN KEY ("scope_organization_id","business_event_id") REFERENCES "public"."business_events"("scope_organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_global_product" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_membership_user" FOREIGN KEY ("membership_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_reversal_identity" FOREIGN KEY ("reverses_change_id") REFERENCES "public"."business_event_changes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_reversal_owner" FOREIGN KEY ("scope_organization_id","reverses_change_id") REFERENCES "public"."business_event_changes"("scope_organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_inventory_item" FOREIGN KEY ("organization_id","inventory_item_id") REFERENCES "public"."inventory_items"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_supplier" FOREIGN KEY ("organization_id","supplier_id") REFERENCES "public"."suppliers"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_purchase" FOREIGN KEY ("organization_id","purchase_id") REFERENCES "public"."purchases"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_purchase_item" FOREIGN KEY ("organization_id","purchase_item_id") REFERENCES "public"."purchase_items"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_supplier_payment" FOREIGN KEY ("organization_id","supplier_payment_id") REFERENCES "public"."supplier_payments"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_supplier_payment_allocation" FOREIGN KEY ("organization_id","supplier_payment_allocation_id") REFERENCES "public"."supplier_payment_allocations"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_supplier_refund" FOREIGN KEY ("organization_id","supplier_refund_id") REFERENCES "public"."supplier_refunds"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_purchase_expense" FOREIGN KEY ("organization_id","purchase_expense_id") REFERENCES "public"."purchase_expenses"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_acquisition_expense_allocation" FOREIGN KEY ("organization_id","acquisition_expense_allocation_id") REFERENCES "public"."acquisition_expense_allocations"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_customer" FOREIGN KEY ("organization_id","customer_id") REFERENCES "public"."customers"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_sale_expense" FOREIGN KEY ("organization_id","sale_expense_id") REFERENCES "public"."sale_expenses"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_customer_payment" FOREIGN KEY ("organization_id","customer_payment_id") REFERENCES "public"."customer_payments"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_customer_payment_allocation" FOREIGN KEY ("organization_id","customer_payment_allocation_id") REFERENCES "public"."customer_payment_allocations"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_customer_refund" FOREIGN KEY ("organization_id","customer_refund_id") REFERENCES "public"."customer_refunds"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_return" FOREIGN KEY ("organization_id","return_id") REFERENCES "public"."returns"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_return_item" FOREIGN KEY ("organization_id","return_item_id") REFERENCES "public"."return_items"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_retained_income" FOREIGN KEY ("organization_id","retained_income_id") REFERENCES "public"."retained_income"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_retained_income_allocation" FOREIGN KEY ("organization_id","retained_income_allocation_id") REFERENCES "public"."retained_income_allocations"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_loss" FOREIGN KEY ("organization_id","loss_id") REFERENCES "public"."losses"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_customer_settlement_id" FOREIGN KEY ("organization_id","customer_settlement_id") REFERENCES "public"."customer_settlements"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_customer_settlement_source_allocation_id" FOREIGN KEY ("organization_id","customer_settlement_source_allocation_id") REFERENCES "public"."customer_settlement_source_allocations"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_supplier_settlement_id" FOREIGN KEY ("organization_id","supplier_settlement_id") REFERENCES "public"."supplier_settlements"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_supplier_settlement_source_allocation_id" FOREIGN KEY ("organization_id","supplier_settlement_source_allocation_id") REFERENCES "public"."supplier_settlement_source_allocations"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_purchase_expense_payment" FOREIGN KEY ("organization_id","purchase_expense_payment_id") REFERENCES "public"."purchase_expense_payments"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_event_changes" ADD CONSTRAINT "change_sale_expense_payment" FOREIGN KEY ("organization_id","sale_expense_payment_id") REFERENCES "public"."sale_expense_payments"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_events" ADD CONSTRAINT "owner_business_events" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_events" ADD CONSTRAINT "event_actor" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_events" ADD CONSTRAINT "event_context" FOREIGN KEY ("context_organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_events" ADD CONSTRAINT "event_reversal_identity" FOREIGN KEY ("reverses_event_id") REFERENCES "public"."business_events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_events" ADD CONSTRAINT "event_reversal_owner" FOREIGN KEY ("scope_organization_id","reverses_event_id") REFERENCES "public"."business_events"("scope_organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "losses" ADD CONSTRAINT "owner_losses" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "losses" ADD CONSTRAINT "loss_inventory_item" FOREIGN KEY ("organization_id","inventory_item_id") REFERENCES "public"."inventory_items"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "losses" ADD CONSTRAINT "loss_purchase" FOREIGN KEY ("organization_id","purchase_id") REFERENCES "public"."purchases"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "losses" ADD CONSTRAINT "loss_sale" FOREIGN KEY ("organization_id","sale_id") REFERENCES "public"."sales"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "losses" ADD CONSTRAINT "created_losses" FOREIGN KEY ("organization_id","created_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "losses" ADD CONSTRAINT "losses_reversed" FOREIGN KEY ("organization_id","reversed_event_id") REFERENCES "public"."business_events"("organization_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "memberships_organization_idx" ON "memberships" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "inventory_items_organization_idx" ON "inventory_items" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "one_collection_unit" ON "inventory_items" USING btree ("organization_id","product_id") WHERE sale_status = 'collection';--> statement-breakpoint
CREATE INDEX "purchase_items_organization_idx" ON "purchase_items" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "purchases_organization_idx" ON "purchases" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "one_opening_purchase" ON "purchases" USING btree ("organization_id","supplier_id","opening_month") WHERE is_opening;--> statement-breakpoint
CREATE INDEX "supplier_payment_allocations_organization_idx" ON "supplier_payment_allocations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "supplier_payments_organization_idx" ON "supplier_payments" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "supplier_refunds_organization_idx" ON "supplier_refunds" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "supplier_settlement_source_allocations_organization_idx" ON "supplier_settlement_source_allocations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "supplier_settlements_organization_idx" ON "supplier_settlements" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "suppliers_organization_idx" ON "suppliers" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "one_unknown_supplier" ON "suppliers" USING btree ("organization_id") WHERE is_unknown;--> statement-breakpoint
CREATE INDEX "acquisition_expense_allocations_organization_idx" ON "acquisition_expense_allocations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "purchase_expense_payments_organization_idx" ON "purchase_expense_payments" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "purchase_expenses_organization_idx" ON "purchase_expenses" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "sale_expense_payments_organization_idx" ON "sale_expense_payments" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "sale_expenses_organization_idx" ON "sale_expenses" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "customers_organization_idx" ON "customers" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "return_items_organization_idx" ON "return_items" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "returns_organization_idx" ON "returns" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "sale_items_organization_idx" ON "sale_items" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "one_active_item_commitment" ON "sale_items" USING btree ("organization_id","inventory_item_id") WHERE released_event_id IS NULL;--> statement-breakpoint
CREATE INDEX "sales_organization_idx" ON "sales" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "customer_payment_allocations_organization_idx" ON "customer_payment_allocations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "customer_payments_organization_idx" ON "customer_payments" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "customer_refunds_organization_idx" ON "customer_refunds" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "customer_settlement_source_allocations_organization_idx" ON "customer_settlement_source_allocations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "customer_settlements_organization_idx" ON "customer_settlements" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "retained_income_organization_idx" ON "retained_income" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "retained_income_allocations_organization_idx" ON "retained_income_allocations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "losses_organization_idx" ON "losses" USING btree ("organization_id");
