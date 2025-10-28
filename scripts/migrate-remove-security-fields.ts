import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function removeSecurityFields() {
  console.log("🔄 Removing security fields from users table...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    const migrationPath = path.join(__dirname, "../migrations/remove_user_security_fields.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    console.log("\n📄 Executing migration:");
    console.log("   File: remove_user_security_fields.sql");
    console.log("   Removing security fields from users table...");

    await db.execute(sql.raw(migrationSQL));

    console.log("\n✅ Migration completed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n📋 Removed columns:");
    console.log("   ✓ must_change_password");
    console.log("   ✓ login_attempts");
    console.log("   ✓ locked_until");
    console.log("   ✓ last_login_at");
    console.log("   ✓ last_login_ip");
    console.log("   ✓ password_changed_at");
    console.log("   ✓ updated_at");
    console.log("\n📋 Cleaned up:");
    console.log("   ✓ Truncated users table (ready for demo seed)");
    console.log("\n⚠️  Next step: Run npm run seed:users to create demo accounts");

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  }
}

removeSecurityFields()
  .then(() => {
    console.log("\n🎉 Security fields removed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration error:", error);
    process.exit(1);
  });
