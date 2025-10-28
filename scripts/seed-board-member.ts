import "dotenv/config";
import { db } from "../server/db";
import { users } from "@shared/schema";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";

/**
 * Seed board member: Dan Ward
 * - Board Member role
 * - Owns Units 205 & 208
 * - Can edit unit information and assessments
 * - Cannot modify bank accounts or delete records
 */

async function seedBoardMember() {
  console.log("🔐 Creating board member user...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Generate cryptographically secure password
  function generateSecurePassword(): string {
    const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowercase = "abcdefghjkmnpqrstuvwxyz";
    const numbers = "23456789";
    const special = "!@#$%^&*";
    const allChars = uppercase + lowercase + numbers + special;
    
    const length = 20;
    let password = "";
    
    // Ensure at least one of each type
    password += uppercase[crypto.randomInt(0, uppercase.length)];
    password += lowercase[crypto.randomInt(0, lowercase.length)];
    password += numbers[crypto.randomInt(0, numbers.length)];
    password += special[crypto.randomInt(0, special.length)];
    
    // Fill remaining length
    for (let i = password.length; i < length; i++) {
      password += allChars[crypto.randomInt(0, allChars.length)];
    }
    
    // Shuffle password
    return password.split('').sort(() => crypto.randomInt(-1, 2)).join('');
  }

  try {
    const danPassword = generateSecurePassword();
    const danHashedPassword = await bcrypt.hash(danPassword, 12);
    
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "dan.ward"),
    });

    if (existingUser) {
      console.log("⚠️  User 'dan.ward' already exists. Skipping creation.");
      return;
    }

    // Create Dan Ward (Board Member)
    await db.insert(users).values({
      username: "dan.ward",
      email: "wardinmiami@gmail.com",
      password: danHashedPassword,
      role: "board_member",
      unitId: "205", // Primary unit (also owns 208)
      active: true,
      mustChangePassword: true,
    });

    console.log("\n✅ Board member created successfully!");
    console.log("\n🔑 SAVE THESE CREDENTIALS SECURELY:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Dan Ward - Board Member");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  Username:     dan.ward");
    console.log("  Email:        wardinmiami@gmail.com");
    console.log(`  Password:     ${danPassword}`);
    console.log("  Role:         Board Member");
    console.log("  Primary Unit: 205");
    console.log("  Also Owns:    208");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n📋 Permissions:");
    console.log("  ✅ View all units and financial reports");
    console.log("  ✅ Edit unit information and notes");
    console.log("  ✅ Update delinquency status");
    console.log("  ✅ Mark assessments as paid");
    console.log("  ✅ Send notices to owners");
    console.log("  ❌ Cannot delete units or owners");
    console.log("  ❌ Cannot modify bank accounts");
    console.log("  ❌ Cannot transfer funds");
    console.log("\n⚠️  User MUST change password on first login");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
  } catch (error) {
    console.error("❌ Error creating board member:", error);
    throw error;
  }
}

seedBoardMember()
  .then(() => {
    console.log("\n🎉 Board member seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });
