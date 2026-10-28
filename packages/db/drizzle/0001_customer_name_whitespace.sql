ALTER TABLE "customers" DROP CONSTRAINT "customer_nonblank_name";--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customer_nonblank_name" CHECK ("customers"."name" ~ '[^[:space:]]');