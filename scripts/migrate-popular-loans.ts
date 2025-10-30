import { config } from "dotenv";
config();

import { db } from "../server/db";
import { sql } from "drizzle-orm";

/**
 * MIGRATION: Create Popular Loans & Report Imports Tables
 *
 * Adds tracking for Popular Bank loans per unit with import audit trail.
 */

async function migratePopularLoans() {
  console.log("🔧 MIGRATING DATABASE - Adding Popular Loans Tables");
  console.log("=".repeat(70));
  console.log("");

  try {
    console.log("Creating report_imports table...");
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS report_imports (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        vendor TEXT NOT NULL,
        period_month INTEGER CHECK (period_month BETWEEN 1 AND 12),
        period_year INTEGER CHECK (period_year >= 2020),
        filename TEXT,
        imported_by VARCHAR REFERENCES users(id),
        imported_at TIMESTAMPTZ DEFAULT NOW(),
        notes TEXT
      )
    `));
    console.log("✅ Created report_imports table");

    console.log("\nCreating popular_loans table...");
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS popular_loans (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        unit VARCHAR(10) NOT NULL,
        loan_number TEXT,
        lender TEXT DEFAULT 'Popular Bank',
        status TEXT CHECK (status IN ('OWES', 'PAID')) NOT NULL,
        current_balance NUMERIC(12,2) DEFAULT 0,
        last_payment_date DATE,
        source_report_id VARCHAR REFERENCES report_imports(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `));
    console.log("✅ Created popular_loans table");

    console.log("\nCreating indexes...");
    await db.execute(sql.raw(`
      CREATE INDEX IF NOT EXISTS idx_popular_loans_unit
        ON popular_loans(unit)
    `));
    await db.execute(sql.raw(`
      CREATE INDEX IF NOT EXISTS idx_popular_loans_unit_created
        ON popular_loans(unit, created_at DESC)
    `));
    await db.execute(sql.raw(`
      CREATE INDEX IF NOT EXISTS idx_popular_loans_source
        ON popular_loans(source_report_id)
    `));
    console.log("✅ Created indexes");

    console.log("\nCreating view for units with popular loans...");
    await db.execute(sql.raw(`
      CREATE OR REPLACE VIEW v_units_with_popular AS
      SELECT
        u.id,
        u.unit_number,
        u.monthly_maintenance,
        u.total_owed,
        u.delinquency_status,
        u.priority_level,
        pl.loan_number,
        pl.status as popular_status,
        pl.current_balance as popular_balance,
        pl.last_payment_date as popular_last_payment
      FROM units u
      LEFT JOIN LATERAL (
        SELECT pl.*
        FROM popular_loans pl
        WHERE pl.unit = u.unit_number
        ORDER BY pl.created_at DESC
        LIMIT 1
      ) pl ON true
    `));
    console.log("✅ Created v_units_with_popular view");

    console.log("");
    console.log("=".repeat(70));
    console.log("✅ Migration completed successfully!");
    console.log("=".repeat(70));

  } catch (error) {
    console.error("");
    console.error("❌ Migration failed:", error);
    console.error("");
    throw error;
  }
}

migratePopularLoans()
  .then(() => {
    console.log("\n✅ Popular Loans migration completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Popular Loans migration failed:", error);
    process.exit(1);
  });
