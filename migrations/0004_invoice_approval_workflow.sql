-- Add approval workflow fields to invoices table
ALTER TABLE "invoices" ADD COLUMN "file_name" text;
ALTER TABLE "invoices" ADD COLUMN "approved_at" timestamp;
ALTER TABLE "invoices" ADD COLUMN "rejected_by" varchar;
ALTER TABLE "invoices" ADD COLUMN "rejected_at" timestamp;
ALTER TABLE "invoices" ADD COLUMN "rejection_reason" text;

-- Update status to allow 'rejected'
-- Note: PostgreSQL doesn't enforce enum types in text columns, so this is just documentation
COMMENT ON COLUMN "invoices"."status" IS 'Status: pending, approved, rejected, paid';
