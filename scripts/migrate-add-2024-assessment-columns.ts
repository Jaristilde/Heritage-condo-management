import { config } from "dotenv";
config(); // Load .env file

import { db } from "../server/db";
import { sql } from "drizzle-orm";

/**
 * DIRECT SQL MIGRATION - Add 2024 Assessment Columns
 *
 * This script directly adds the new columns to the units table
 * without requiring interactive prompts.
 */

async function migrateAdd2024AssessmentColumns() {
  console.log("🔧 MIGRATING DATABASE - Adding 2024 Assessment Columns");
  console.log("=".repeat(70));
  console.log("");

  try {
    console.log("Adding new columns to units table...");
    console.log("");

    // Add columns one by one with error handling
    const migrations = [
      {
        name: "monthly_popular_loan",
        sql: `ALTER TABLE units ADD COLUMN IF NOT EXISTS monthly_popular_loan DECIMAL(10,2) NOT NULL DEFAULT '0'`
      },
      {
        name: "monthly_assessment_plan",
        sql: `ALTER TABLE units ADD COLUMN IF NOT EXISTS monthly_assessment_plan DECIMAL(10,2) NOT NULL DEFAULT '0'`
      },
      {
        name: "popular_loan_balance",
        sql: `ALTER TABLE units ADD COLUMN IF NOT EXISTS popular_loan_balance DECIMAL(10,2) NOT NULL DEFAULT '0'`
      },
      {
        name: "credit_balance",
        sql: `ALTER TABLE units ADD COLUMN IF NOT EXISTS credit_balance DECIMAL(10,2) NOT NULL DEFAULT '0'`
      },
      {
        name: "assessment_2024_original",
        sql: `ALTER TABLE units ADD COLUMN IF NOT EXISTS assessment_2024_original DECIMAL(10,2) NOT NULL DEFAULT '11920.92'`
      },
      {
        name: "assessment_2024_paid",
        sql: `ALTER TABLE units ADD COLUMN IF NOT EXISTS assessment_2024_paid DECIMAL(10,2) NOT NULL DEFAULT '0'`
      },
      {
        name: "assessment_2024_remaining",
        sql: `ALTER TABLE units ADD COLUMN IF NOT EXISTS assessment_2024_remaining DECIMAL(10,2) NOT NULL DEFAULT '0'`
      },
      {
        name: "assessment_2024_status",
        sql: `ALTER TABLE units ADD COLUMN IF NOT EXISTS assessment_2024_status TEXT NOT NULL DEFAULT 'pending'`
      },
      {
        name: "on_assessment_plan",
        sql: `ALTER TABLE units ADD COLUMN IF NOT EXISTS on_assessment_plan BOOLEAN NOT NULL DEFAULT false`
      },
      {
        name: "assessment_plan_start_date",
        sql: `ALTER TABLE units ADD COLUMN IF NOT EXISTS assessment_plan_start_date TIMESTAMP`
      },
      {
        name: "assessment_plan_end_date",
        sql: `ALTER TABLE units ADD COLUMN IF NOT EXISTS assessment_plan_end_date TIMESTAMP`
      },
      {
        name: "assessment_plan_monthly",
        sql: `ALTER TABLE units ADD COLUMN IF NOT EXISTS assessment_plan_monthly DECIMAL(10,2) NOT NULL DEFAULT '0'`
      },
      {
        name: "assessment_plan_months_total",
        sql: `ALTER TABLE units ADD COLUMN IF NOT EXISTS assessment_plan_months_total INTEGER DEFAULT 0`
      },
      {
        name: "assessment_plan_months_completed",
        sql: `ALTER TABLE units ADD COLUMN IF NOT EXISTS assessment_plan_months_completed INTEGER DEFAULT 0`
      },
      {
        name: "red_flag",
        sql: `ALTER TABLE units ADD COLUMN IF NOT EXISTS red_flag BOOLEAN NOT NULL DEFAULT false`
      },
      {
        name: "with_attorney",
        sql: `ALTER TABLE units ADD COLUMN IF NOT EXISTS with_attorney BOOLEAN NOT NULL DEFAULT false`
      },
      {
        name: "in_foreclosure",
        sql: `ALTER TABLE units ADD COLUMN IF NOT EXISTS in_foreclosure BOOLEAN NOT NULL DEFAULT false`
      },
      {
        name: "legal_notes",
        sql: `ALTER TABLE units ADD COLUMN IF NOT EXISTS legal_notes TEXT`
      }
    ];

    let successCount = 0;
    let skipCount = 0;

    for (const migration of migrations) {
      try {
        await db.execute(sql.raw(migration.sql));
        console.log(`✅ Added column: ${migration.name}`);
        successCount++;
      } catch (error: any) {
        if (error.message && error.message.includes("already exists")) {
          console.log(`⏭️  Column already exists: ${migration.name}`);
          skipCount++;
        } else {
          console.error(`❌ Error adding ${migration.name}:`, error.message);
          throw error;
        }
      }
    }

    console.log("");
    console.log("=".repeat(70));
    console.log(`✅ Successfully added: ${successCount} columns`);
    console.log(`⏭️  Already existed: ${skipCount} columns`);
    console.log("");
    console.log("🎯 Database schema updated successfully!");
    console.log("📊 Next: Run the data population script");
    console.log("=".repeat(70));

  } catch (error) {
    console.error("");
    console.error("❌ Migration failed:", error);
    console.error("");
    throw error;
  }
}

migrateAdd2024AssessmentColumns()
  .then(() => {
    console.log("\n✅ Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });
