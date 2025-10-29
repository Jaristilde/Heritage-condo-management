import "dotenv/config";
import { db } from "../server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

/**
 * DEMO MODE: Disable forced password changes and update demo passwords
 *
 * TODO: BEFORE PRODUCTION - RE-ENABLE PASSWORD SECURITY:
 * 1. Set mustChangePassword: true for all users
 * 2. Use strong passwords from environment variables
 * 3. Re-enable password change middleware
 * 4. Test with real users
 */

async function disablePasswordChangeForDemo() {
  console.log("🔓 DEMO MODE: Disabling forced password changes...");
  console.log("====================================================");
  console.log("");
  console.log("⚠️  TODO: Re-enable security features before production!");
  console.log("");

  try {
    // Hash new passwords
    const boardPassword = await bcrypt.hash("board1806", 10);
    const managementPassword = await bcrypt.hash("management1806", 10);

    console.log("1️⃣  Updating board password...");
    await db
      .update(users)
      .set({
        password: boardPassword,
        mustChangePassword: false,
      })
      .where(eq(users.username, "board"));
    console.log("   ✅ Board password updated to: board1806");

    console.log("");
    console.log("2️⃣  Updating management password...");
    await db
      .update(users)
      .set({
        password: managementPassword,
        mustChangePassword: false,
      })
      .where(eq(users.username, "management"));
    console.log("   ✅ Management password updated to: management1806");

    console.log("");
    console.log("3️⃣  Disabling forced password change for all users...");

    // Update all users to disable mustChangePassword
    const allUsers = await db.select().from(users);
    let updated = 0;

    for (const user of allUsers) {
      if (user.mustChangePassword) {
        await db
          .update(users)
          .set({ mustChangePassword: false })
          .where(eq(users.id, user.id));
        updated++;
      }
    }

    console.log(`   ✅ Updated ${updated} users to disable forced password change`);

    console.log("");
    console.log("====================================================");
    console.log("✅ DEMO MODE CONFIGURATION COMPLETE!");
    console.log("");
    console.log("📝 Demo Login Credentials:");
    console.log("   Board:      board / board1806");
    console.log("   Management: management / management1806");
    console.log("   Owners:     owner[unit#] / owner[unit#]");
    console.log("   Example:    owner202 / owner202");
    console.log("");
    console.log("🔓 All users can now login without password change prompts");
    console.log("");
    console.log("⚠️  IMPORTANT: Re-enable security before production!");
    console.log("   - Set mustChangePassword: true");
    console.log("   - Use strong environment-based passwords");
    console.log("   - Re-enable password change middleware");

  } catch (error) {
    console.error("❌ Error updating users:", error);
    throw error;
  }
}

// Run the script
disablePasswordChangeForDemo()
  .then(() => {
    console.log("");
    console.log("✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("");
    console.error("💥 Failed:", error);
    process.exit(1);
  });
