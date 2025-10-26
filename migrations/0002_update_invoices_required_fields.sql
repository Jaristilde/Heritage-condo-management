-- Make invoice_number and due_date required in invoices table
-- First, update any existing NULL values to a default value
UPDATE "invoices" SET "invoice_number" = 'PENDING' WHERE "invoice_number" IS NULL;
UPDATE "invoices" SET "due_date" = "invoice_date" WHERE "due_date" IS NULL;

-- Now make the columns NOT NULL
ALTER TABLE "invoices" ALTER COLUMN "invoice_number" SET NOT NULL;
ALTER TABLE "invoices" ALTER COLUMN "due_date" SET NOT NULL;
