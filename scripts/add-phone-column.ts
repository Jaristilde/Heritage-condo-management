import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

/**
 * Add phone and sms_notifications columns to users table
 * Required for SMS notification feature
 */

async function addPhoneColumn() {
  console.log("📱 Adding phone and SMS notification columns to users table...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // Add phone column
    await db.execute(sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS phone TEXT
    `);
    console.log("✅ Added phone column");

    // Add sms_notifications column
    await db.execute(sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN NOT NULL DEFAULT false
    `);
    console.log("✅ Added sms_notifications column");

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 Migration complete!");
    console.log("");
    console.log("You can now:");
    console.log("  - Log in as owner201 / owner1806");
    console.log("  - Set up SMS notifications for board members");
    console.log("");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

addPhoneColumn()
  .then(() => {
    console.log("✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
