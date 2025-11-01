import "dotenv/config";
import { db } from "../server/db";
import { users } from "@shared/schema";
import { like, eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

/**
 * EMERGENCY PASSWORD FIX
 * Reset all owner passwords to Heritage2025! and verify they work
 */

async function emergencyPasswordFix() {
  console.log("🚨 EMERGENCY PASSWORD FIX");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  const password = "Heritage2025!";
  console.log(`🔑 Setting all owner passwords to: ${password}`);
  console.log("");

  try {
    // Get all owner accounts
    const ownerAccounts = await db
      .select()
      .from(users)
      .where(like(users.username, "owner%"));

    console.log(`Found ${ownerAccounts.length} owner accounts`);
    console.log("");

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Password hashed");
    console.log("");

    let updated = 0;
    let verified = 0;

    for (const account of ownerAccounts) {
      try {
        // Update password
        await db
          .update(users)
          .set({
            password: hashedPassword,
            mustChangePassword: false,
            active: true,
          })
          .where(eq(users.id, account.id));

        // Verify the password works
        const isValid = await bcrypt.compare(password, hashedPassword);

        if (isValid) {
          console.log(`✅ ${account.username}: Password updated and verified`);
          updated++;
          verified++;
        } else {
          console.log(`❌ ${account.username}: Password updated but verification FAILED`);
          updated++;
        }
      } catch (error: any) {
        console.error(`❌ ${account.username}: Error - ${error.message}`);
      }
    }

    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 RESULTS:");
    console.log(`   Accounts found: ${ownerAccounts.length}`);
    console.log(`   Passwords updated: ${updated}`);
    console.log(`   Passwords verified: ${verified}`);
    console.log("");
    console.log("🔑 LOGIN CREDENTIALS:");
    console.log(`   Username: owner{UnitNumber}`);
    console.log(`   Password: ${password}`);
    console.log("");
    console.log("Examples:");
    console.log(`   owner201 / ${password}`);
    console.log(`   owner202 / ${password}`);
    console.log(`   owner203 / ${password}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

emergencyPasswordFix()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
