import "dotenv/config";
import { db } from "../server/db";
import { users } from "@shared/schema";
import { like } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

/**
 * Reset all owner passwords to a simple, easy-to-remember password
 *
 * New password: Heritage2025!
 *
 * This makes it easier for owners to log in without having to remember
 * complex randomly-generated passwords.
 */

async function resetOwnerPasswords() {
  console.log("🔑 Resetting all owner passwords to simple password...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  try {
    // New simple password
    const newPassword = "Heritage2025!";
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Get all owner accounts
    const ownerAccounts = await db
      .select()
      .from(users)
      .where(like(users.username, "owner%"));

    console.log(`Found ${ownerAccounts.length} owner accounts`);
    console.log("");

    let updated = 0;

    for (const owner of ownerAccounts) {
      try {
        await db
          .update(users)
          .set({
            password: hashedPassword,
            mustChangePassword: false
          })
          .where(like(users.id, owner.id));

        console.log(`✅ ${owner.username.padEnd(10)} - Password reset`);
        updated++;

      } catch (error: any) {
        console.error(`❌ Failed to reset ${owner.username}:`, error.message);
      }
    }

    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ Reset: ${updated} passwords`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
    console.log("🔑 NEW LOGIN CREDENTIALS FOR ALL OWNERS:");
    console.log("   Username: owner{UnitNumber}");
    console.log("   Password: Heritage2025!");
    console.log("");
    console.log("Examples:");
    console.log("   Unit 201: owner201 / Heritage2025!");
    console.log("   Unit 202: owner202 / Heritage2025!");
    console.log("   Unit 301: owner301 / Heritage2025!");
    console.log("");
    console.log("⚠️  All owners now use the SAME password for easy access");
    console.log("   They can change it later if they want more security");
    console.log("");

  } catch (error) {
    console.error("❌ Error resetting passwords:", error);
    throw error;
  }
}

resetOwnerPasswords()
  .then(() => {
    console.log("🎉 Password reset complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
