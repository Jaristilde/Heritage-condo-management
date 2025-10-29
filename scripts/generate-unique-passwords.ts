import "dotenv/config";
import { db } from "../server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * Generate unique passwords for all 24 owner accounts
 * and set them to require password change on first login
 */

// Generate a secure random password
function generatePassword(): string {
  const lowercase = "abcdefghjkmnpqrstuvwxyz";
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const symbols = "!@#$%";

  const all = lowercase + uppercase + numbers + symbols;

  let password = "";
  // Ensure at least one of each type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest (total 12 characters)
  for (let i = 0; i < 8; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

const unitNumbers = [
  "201", "202", "203", "204", "205", "206", "207", "208",
  "301", "302", "303", "304", "305", "306", "307", "308",
  "401", "402", "403", "404", "405", "406", "407", "408"
];

async function generateUniquePasswords() {
  console.log("🔐 Generating unique passwords for all 24 owners...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  const passwordList: Array<{unitNumber: string, username: string, password: string, email: string}> = [];
  let updated = 0;
  let notFound = 0;

  for (const unitNumber of unitNumbers) {
    const username = `owner${unitNumber}`;

    try {
      // Check if user exists
      const userArray = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (userArray.length === 0) {
        console.log(`   ⚠️  ${username} not found - skipping`);
        notFound++;
        continue;
      }

      const user = userArray[0];

      // Generate unique password
      const newPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user with new password and set mustChangePassword = true
      await db
        .update(users)
        .set({
          password: hashedPassword,
          mustChangePassword: true,
        })
        .where(eq(users.username, username));

      passwordList.push({
        unitNumber,
        username,
        password: newPassword,
        email: user.email,
      });

      updated++;
      console.log(`   ✅ ${username}: Password generated`);

    } catch (error) {
      console.error(`   ❌ Error for ${username}:`, error);
    }
  }

  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Password Generation Complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log(`📊 Summary:`);
  console.log(`   Passwords updated: ${updated}`);
  console.log(`   Users not found: ${notFound}`);
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔑 OWNER LOGIN CREDENTIALS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("⚠️  IMPORTANT: Owners MUST change their password on first login!");
  console.log("");

  // Print password list in a nice format
  passwordList.forEach((item) => {
    console.log(`Unit ${item.unitNumber}:`);
    console.log(`  Username: ${item.username}`);
    console.log(`  Temporary Password: ${item.password}`);
    console.log(`  Email: ${item.email}`);
    console.log("");
  });

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 NEXT STEPS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("1. Save these credentials securely");
  console.log("2. Email each owner their unique credentials");
  console.log("3. Owners will be forced to change password on first login");
  console.log("");

  // Also save to a file
  const fs = require('fs');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `owner-credentials-${timestamp}.txt`;

  let fileContent = "═══════════════════════════════════════════════════════════\n";
  fileContent += "HERITAGE CONDOMINIUM - OWNER LOGIN CREDENTIALS\n";
  fileContent += `Generated: ${new Date().toLocaleString()}\n`;
  fileContent += "═══════════════════════════════════════════════════════════\n\n";
  fileContent += "⚠️  IMPORTANT: Owners MUST change their password on first login!\n\n";

  passwordList.forEach((item) => {
    fileContent += `Unit ${item.unitNumber}:\n`;
    fileContent += `  Username: ${item.username}\n`;
    fileContent += `  Temporary Password: ${item.password}\n`;
    fileContent += `  Email: ${item.email}\n\n`;
  });

  fileContent += "═══════════════════════════════════════════════════════════\n";
  fileContent += "Login URL: http://localhost:5001/login\n";
  fileContent += "═══════════════════════════════════════════════════════════\n";

  fs.writeFileSync(filename, fileContent);
  console.log(`💾 Credentials saved to: ${filename}`);
  console.log("");
}

generateUniquePasswords()
  .then(() => {
    console.log("🚀 All passwords generated and saved!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed:", error);
    process.exit(1);
  });
