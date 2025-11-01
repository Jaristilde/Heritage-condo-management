import "dotenv/config";
import { db } from "../server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

/**
 * Test login for a specific user
 */

async function testLogin() {
  const username = "owner202";
  const password = "Heritage2025!";

  console.log("🧪 Testing Login");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
  console.log("");

  try {
    // Get user from database
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (userResult.length === 0) {
      console.log("❌ USER NOT FOUND");
      return;
    }

    const user = userResult[0];

    console.log("✅ User found in database:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.active}`);
    console.log(`   Unit ID: ${user.unitId}`);
    console.log("");

    // Test password
    console.log("🔐 Testing password...");
    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
      console.log("✅ PASSWORD VALID - Login should work!");
    } else {
      console.log("❌ PASSWORD INVALID - Login will fail!");
      console.log("");
      console.log("Debugging info:");
      console.log(`   Provided password: ${password}`);
      console.log(`   Stored hash (first 60 chars): ${user.password.substring(0, 60)}...`);
    }

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

testLogin()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
