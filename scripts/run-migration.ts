import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log("🔄 Running database migration...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // Read the SQL migration file
    const migrationPath = path.join(__dirname, "../migrations/add_user_security_fields.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    console.log("\n📄 Executing migration:");
    console.log("   File: add_user_security_fields.sql");
    console.log("   Adding security fields to users table...");

    // Execute the migration
    await db.execute(sql.raw(migrationSQL));

    console.log("\n✅ Migration completed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n📋 Added columns:");
    console.log("   ✓ must_change_password (boolean)");
    console.log("   ✓ login_attempts (integer)");
    console.log("   ✓ locked_until (timestamp)");
    console.log("   ✓ last_login_at (timestamp)");
    console.log("   ✓ last_login_ip (text)");
    console.log("   ✓ password_changed_at (timestamp)");
    console.log("   ✓ updated_at (timestamp)");

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  }
}

runMigration()
  .then(() => {
    console.log("\n🎉 All migrations complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration error:", error);
    process.exit(1);
  });
