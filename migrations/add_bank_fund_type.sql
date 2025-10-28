-- Add fund_type column to bank_accounts table
-- Required for July 2025 financial data seeding

ALTER TABLE bank_accounts
  ADD COLUMN IF NOT EXISTS fund_type TEXT NOT NULL DEFAULT 'operating';

-- Update existing accounts
UPDATE bank_accounts
SET fund_type = CASE
  WHEN account_type = 'RESERVE' THEN 'reserve'
  WHEN account_type = 'ESCROW' THEN 'escrow'
  ELSE 'operating'
END;
