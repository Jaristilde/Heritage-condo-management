import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

/**
 * Add owner information columns to units table
 * This allows us to display owner data directly in the units view
 * and in the owner portal
 */

async function addOwnerColumns() {
  console.log("📋 Adding owner information columns to units table...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // Add owner name column
    await db.execute(sql`
      ALTER TABLE units
      ADD COLUMN IF NOT EXISTS owner_name TEXT
    `);
    console.log("✅ Added owner_name column");

    // Add owner email column
    await db.execute(sql`
      ALTER TABLE units
      ADD COLUMN IF NOT EXISTS owner_email TEXT
    `);
    console.log("✅ Added owner_email column");

    // Add owner phone column
    await db.execute(sql`
      ALTER TABLE units
      ADD COLUMN IF NOT EXISTS owner_phone TEXT
    `);
    console.log("✅ Added owner_phone column");

    // Add owner mailing address column
    await db.execute(sql`
      ALTER TABLE units
      ADD COLUMN IF NOT EXISTS owner_mailing_address TEXT
    `);
    console.log("✅ Added owner_mailing_address column");

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 Migration complete!");
    console.log("");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

addOwnerColumns()
  .then(() => {
    console.log("✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
