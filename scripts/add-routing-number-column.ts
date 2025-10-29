import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

/**
 * Add routing_number column to bank_accounts table
 * This fixes the schema mismatch issue
 */
async function addRoutingNumberColumn() {
  console.log("🔧 Adding routing_number column to bank_accounts table...\n");

  try {
    await db.execute(sql`
      ALTER TABLE bank_accounts
      ADD COLUMN IF NOT EXISTS routing_number TEXT
    `);

    console.log("✅ Successfully added routing_number column!");
    console.log("\n📋 Column details:");
    console.log("   Table: bank_accounts");
    console.log("   Column: routing_number");
    console.log("   Type: TEXT");
    console.log("   Nullable: YES");

  } catch (error: any) {
    console.error("❌ Error adding column:", error.message);
    throw error;
  }
}

addRoutingNumberColumn()
  .then(() => {
    console.log("\n✅ Migration complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration failed:", error);
    process.exit(1);
  });
