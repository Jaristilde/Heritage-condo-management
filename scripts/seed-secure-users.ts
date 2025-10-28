import "dotenv/config";
import { db } from "../server/db";
import { users } from "@shared/schema";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";

/**
 * Generate a cryptographically secure random password
 * Requirements: 16+ characters, uppercase, lowercase, numbers, special characters
 */
function generateSecurePassword(length: number = 20): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const all = uppercase + lowercase + numbers + special;

  let password = "";

  // Ensure at least one of each required character type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    const randomIndex = crypto.randomInt(0, all.length);
    password += all[randomIndex];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Seed secure users with temporary passwords
 * Users MUST change password on first login
 */
async function seedSecureUsers() {
  console.log("\n🔐 Seeding secure users...\n");

  const usersToCreate = [
    {
      username: "admin",
      email: "admin@heritage-condo.com",
      role: "super_admin",
      description: "Super Administrator - Full system access",
    },
    {
      username: "board.secretary",
      email: "secretary@heritage-condo.com",
      role: "board_secretary",
      description: "Board Secretary - Financial oversight",
    },
    {
      username: "board.treasurer",
      email: "treasurer@heritage-condo.com",
      role: "board_treasurer",
      description: "Board Treasurer - Financial management",
    },
  ];

  const credentials: Array<{
    username: string;
    email: string;
    role: string;
    temporaryPassword: string;
  }> = [];

  for (const user of usersToCreate) {
    try {
      // Generate secure temporary password
      const temporaryPassword = generateSecurePassword(20);
      const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

      // Create user
      await db.insert(users).values({
        username: user.username,
        password: hashedPassword,
        email: user.email,
        role: user.role,
        active: true,
        mustChangePassword: true, // Force password change on first login
        loginAttempts: 0,
      });

      console.log(`✅ Created ${user.description}`);

      credentials.push({
        username: user.username,
        email: user.email,
        role: user.role,
        temporaryPassword,
      });
    } catch (error: any) {
      if (error.code === '23505') {
        console.log(`⚠️  User ${user.username} already exists, skipping...`);
      } else {
        console.error(`❌ Error creating user ${user.username}:`, error.message);
      }
    }
  }

  // Display credentials (ONE TIME ONLY)
  if (credentials.length > 0) {
    console.log("\n" + "=".repeat(80));
    console.log("🔑 TEMPORARY CREDENTIALS (SAVE THESE SECURELY - SHOWN ONLY ONCE)");
    console.log("=".repeat(80) + "\n");

    credentials.forEach((cred) => {
      console.log(`User: ${cred.username}`);
      console.log(`Email: ${cred.email}`);
      console.log(`Role: ${cred.role}`);
      console.log(`Temporary Password: ${cred.temporaryPassword}`);
      console.log(`⚠️  MUST CHANGE PASSWORD ON FIRST LOGIN`);
      console.log("-".repeat(80));
    });

    console.log("\n📋 Security Notes:");
    console.log("1. Save these credentials in a secure password manager");
    console.log("2. Users will be forced to change password on first login");
    console.log("3. Passwords must be 12+ characters with uppercase, lowercase, number, and special character");
    console.log("4. Account will be locked after 5 failed login attempts");
    console.log("5. All login activity is logged in the activity_log table");
    console.log("=".repeat(80) + "\n");
  }

  console.log("\n✅ Secure user seeding complete!\n");
  process.exit(0);
}

// Run the seed
seedSecureUsers().catch((error) => {
  console.error("Fatal error during seeding:", error);
  process.exit(1);
});
