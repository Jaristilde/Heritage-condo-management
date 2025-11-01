import "dotenv/config";
import { db } from "../server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

/**
 * Check owner201 account details and verify password
 */

async function checkOwner201() {
  console.log("🔍 Checking owner201 account...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, "owner201"))
      .limit(1);

    if (user.length === 0) {
      console.log("❌ User owner201 NOT FOUND");
      return;
    }

    const account = user[0];
    console.log("✅ User found:");
    console.log(`   Username: ${account.username}`);
    console.log(`   Email: ${account.email}`);
    console.log(`   Role: ${account.role}`);
    console.log(`   Active: ${account.active}`);
    console.log(`   Unit ID: ${account.unitId}`);
    console.log(`   Must Change Password: ${account.mustChangePassword}`);
    console.log("");

    // Test password verification
    const testPassword = "Heritage2025!";
    const isValid = await bcrypt.compare(testPassword, account.password);

    console.log("🔐 Password Verification:");
    console.log(`   Testing password: ${testPassword}`);
    console.log(`   Result: ${isValid ? "✅ VALID" : "❌ INVALID"}`);
    console.log("");

    if (!isValid) {
      console.log("⚠️  Password does NOT match Heritage2025!");
      console.log("   Hashed password in DB:", account.password.substring(0, 60) + "...");
    }

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

checkOwner201()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
