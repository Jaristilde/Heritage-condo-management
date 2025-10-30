import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

/**
 * Manual Migration: Add SA#2 Prior Balance and Related Fields
 *
 * Adds missing SA#2 tracking fields to match SA#1 and Maintenance fund structure:
 * - sa2_prior_balance
 * - sa2_balance
 * - sa2_paid
 */

async function migrateSA2Fields() {
  console.log("🔧 Starting SA#2 fields migration...\n");

  try {
    // Check if columns already exist
    console.log("📋 Checking existing columns...");

    const checkColumns = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'units'
      AND column_name IN ('sa2_prior_balance', 'sa2_balance', 'sa2_paid')
    `);

    const existingColumns = checkColumns.rows.map((row: any) => row.column_name);
    console.log(`Found existing columns: ${existingColumns.join(', ') || 'none'}\n`);

    // Add sa2_prior_balance if it doesn't exist
    if (!existingColumns.includes('sa2_prior_balance')) {
      console.log("➕ Adding sa2_prior_balance column...");
      await db.execute(sql`
        ALTER TABLE units
        ADD COLUMN IF NOT EXISTS sa2_prior_balance NUMERIC(10, 2) NOT NULL DEFAULT 0
      `);
      console.log("✅ sa2_prior_balance column added\n");
    } else {
      console.log("⏭️  sa2_prior_balance already exists, skipping\n");
    }

    // Add sa2_balance if it doesn't exist
    if (!existingColumns.includes('sa2_balance')) {
      console.log("➕ Adding sa2_balance column...");
      await db.execute(sql`
        ALTER TABLE units
        ADD COLUMN IF NOT EXISTS sa2_balance NUMERIC(10, 2) NOT NULL DEFAULT 0
      `);
      console.log("✅ sa2_balance column added\n");
    } else {
      console.log("⏭️  sa2_balance already exists, skipping\n");
    }

    // Add sa2_paid if it doesn't exist
    if (!existingColumns.includes('sa2_paid')) {
      console.log("➕ Adding sa2_paid column...");
      await db.execute(sql`
        ALTER TABLE units
        ADD COLUMN IF NOT EXISTS sa2_paid BOOLEAN NOT NULL DEFAULT false
      `);
      console.log("✅ sa2_paid column added\n");
    } else {
      console.log("⏭️  sa2_paid already exists, skipping\n");
    }

    console.log("=" .repeat(60));
    console.log("🎉 Migration complete!");
    console.log("=" .repeat(60));
    console.log("\n💡 SA#2 fund tracking is now consistent with Maintenance and SA#1\n");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }

  process.exit(0);
}

migrateSA2Fields();
