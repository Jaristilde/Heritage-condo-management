import "dotenv/config";
import { db } from "../server/db";
import { users } from "@shared/schema";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";

/**
 * Seed management company user: Jorge
 * - Management role
 * - Can upload invoices, edit owner info, run reports
 * - Cannot approve budgets or vendor payments
 */

async function seedManagementUser() {
  console.log("🔐 Creating management company user...");
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
    const jorgePassword = generateSecurePassword();
    const jorgeHashedPassword = await bcrypt.hash(jorgePassword, 12);

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "jorge"),
    });

    if (existingUser) {
      console.log("⚠️  User 'jorge' already exists. Skipping creation.");
      return;
    }

    // Create Jorge (Management Company)
    await db.insert(users).values({
      username: "jorge",
      email: "jorge@heritagecondo.com",
      password: jorgeHashedPassword,
      role: "management",
      active: true,
      mustChangePassword: true,
    });

    console.log("\n✅ Management user created successfully!");
    console.log("\n🔑 SAVE THESE CREDENTIALS SECURELY:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Jorge - Management Company");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  Username:     jorge");
    console.log("  Email:        jorge@heritagecondo.com");
    console.log(`  Password:     ${jorgePassword}`);
    console.log("  Role:         Management");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n📋 Permissions:");
    console.log("  ✅ Upload vendor invoices");
    console.log("  ✅ Edit owner/customer information");
    console.log("  ✅ Run all financial reports");
    console.log("  ✅ Export to QuickBooks");
    console.log("  ✅ Record payments from owners");
    console.log("  ✅ Update unit notes");
    console.log("  ✅ Send notices to owners");
    console.log("  ❌ Cannot approve vendor payments");
    console.log("  ❌ Cannot approve budgets");
    console.log("  ❌ Cannot authorize legal action");
    console.log("\n⚠️  User MUST change password on first login");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  } catch (error) {
    console.error("❌ Error creating management user:", error);
    throw error;
  }
}

seedManagementUser()
  .then(() => {
    console.log("\n🎉 Management user seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });
