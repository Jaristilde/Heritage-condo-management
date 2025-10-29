import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

/**
 * Add missing columns to bank_accounts table
 */
async function addBankColumns() {
  console.log("🔧 Adding missing columns to bank_accounts table...\n");

  try {
    // Add minimum_balance column
    await db.execute(sql`
      ALTER TABLE bank_accounts
      ADD COLUMN IF NOT EXISTS minimum_balance NUMERIC(10, 2) DEFAULT 0
    `);
    console.log("✅ Added minimum_balance column");

    // Add reconciled_balance column
    await db.execute(sql`
      ALTER TABLE bank_accounts
      ADD COLUMN IF NOT EXISTS reconciled_balance NUMERIC(10, 2)
    `);
    console.log("✅ Added reconciled_balance column");

    // Add last_reconciled column
    await db.execute(sql`
      ALTER TABLE bank_accounts
      ADD COLUMN IF NOT EXISTS last_reconciled TIMESTAMP
    `);
    console.log("✅ Added last_reconciled column");

    // Add outstanding_checks column
    await db.execute(sql`
      ALTER TABLE bank_accounts
      ADD COLUMN IF NOT EXISTS outstanding_checks JSONB
    `);
    console.log("✅ Added outstanding_checks column");

    console.log("\n✅ All columns added successfully!");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

addBankColumns()
  .then(() => {
    console.log("\n✅ Migration complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration failed:", error);
    process.exit(1);
  });
