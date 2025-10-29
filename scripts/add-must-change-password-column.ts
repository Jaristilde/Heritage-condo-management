import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

/**
 * Add must_change_password column to users table
 */

async function addMustChangePasswordColumn() {
  console.log("🔧 Adding must_change_password column to users table...");

  try {
    // Add the column
    await db.execute(sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false
    `);

    console.log("✅ Column added successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

addMustChangePasswordColumn()
  .then(() => {
    console.log("🚀 Database updated!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed:", error);
    process.exit(1);
  });
