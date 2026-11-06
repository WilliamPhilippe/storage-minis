CREATE TYPE "public"."organization_currency" AS ENUM('BRL', 'USD');--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "nickname" text NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "currency" "organization_currency" DEFAULT 'BRL' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "sessions_valid_after" timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_key_1" UNIQUE("nickname");--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_nickname_format" CHECK (char_length("organizations"."nickname") BETWEEN 3 AND 30 AND "organizations"."nickname" ~ '^[a-z0-9]+(-[a-z0-9]+)*$');