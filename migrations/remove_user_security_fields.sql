-- Remove security fields from users table for demo password system
-- Migration to simplify users table for development/demo

ALTER TABLE users
  DROP COLUMN IF EXISTS must_change_password,
  DROP COLUMN IF EXISTS login_attempts,
  DROP COLUMN IF EXISTS locked_until,
  DROP COLUMN IF EXISTS last_login_at,
  DROP COLUMN IF EXISTS last_login_ip,
  DROP COLUMN IF EXISTS password_changed_at,
  DROP COLUMN IF EXISTS updated_at;

-- Clean up existing users for fresh demo seed
TRUNCATE TABLE users CASCADE;
