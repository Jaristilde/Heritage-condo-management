-- Rename vendor_invoices table to invoices and add gl_code field
ALTER TABLE "vendor_invoices" RENAME TO "invoices";
--> statement-breakpoint
ALTER TABLE "invoices" RENAME COLUMN "document_url" TO "file_url";
--> statement-breakpoint
ALTER TABLE "invoices" RENAME COLUMN "paid_date" TO "payment_date";
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "gl_code" text;
--> statement-breakpoint
-- Create ledger_entries table for unit transaction ledgers
CREATE TABLE "ledger_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" varchar NOT NULL,
	"entry_type" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"date" timestamp NOT NULL,
	"description" text NOT NULL,
	"reference_id" varchar,
	"balance" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
