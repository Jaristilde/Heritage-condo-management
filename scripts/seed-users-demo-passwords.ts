import "dotenv/config";
import { db } from "../server/db";
import { users } from "@shared/schema";
import * as bcrypt from "bcryptjs";

/**
 * Seed demo users with simple passwords for development/testing
 *
 * DEMO ACCOUNTS:
 * - Board: board / board123
 * - Management: management / management123
 * - Owner: owner201 / owner123
 *
 * NO PASSWORD CHANGE REQUIRED - Direct login to dashboard
 */

async function seedDemoUsers() {
  console.log("👥 Creating demo user accounts...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔓 DEMO MODE: Using simple passwords for testing");
  console.log("");

  try {
    // Hash passwords (still using bcrypt for basic security)
    const boardPassword = await bcrypt.hash("board123", 10);
    const managementPassword = await bcrypt.hash("management123", 10);
    const ownerPassword = await bcrypt.hash("owner123", 10);

    const demoUsers = [
      {
        username: "board",
        email: "board@heritagecondo.com",
        password: boardPassword,
        role: "board_secretary",
        unitId: "202", // Joane's unit
        active: true,
      },
      {
        username: "management",
        email: "management@heritagecondo.com",
        password: managementPassword,
        role: "management",
        unitId: null,
        active: true,
      },
      {
        username: "owner201",
        email: "owner201@heritagecondo.com",
        password: ownerPassword,
        role: "owner",
        unitId: "201",
        active: true,
      },
    ];

    for (const user of demoUsers) {
      try {
        await db.insert(users).values(user);
        console.log(`✅ Created: ${user.username.padEnd(15)} | Role: ${user.role.padEnd(20)} | ${user.unitId ? `Unit: ${user.unitId}` : 'No unit'}`);
      } catch (error: any) {
        if (error.code === '23505') {
          console.log(`⚠️  User '${user.username}' already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔑 DEMO LOGIN CREDENTIALS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
    console.log("Board Secretary (Full Access):");
    console.log("  Username: board");
    console.log("  Password: board123");
    console.log("  Unit:     202");
    console.log("");
    console.log("Management (Operations):");
    console.log("  Username: management");
    console.log("  Password: management123");
    console.log("");
    console.log("Owner (Unit 201):");
    console.log("  Username: owner201");
    console.log("  Password: owner123");
    console.log("  Unit:     201");
    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ No password change required");
    console.log("✅ Login goes directly to dashboard");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  } catch (error) {
    console.error("❌ Error creating demo users:", error);
    throw error;
  }
}

seedDemoUsers()
  .then(() => {
    console.log("\n🎉 Demo users seeded successfully!");
    console.log("🚀 Start the server with: npm run dev");
    console.log("🌐 Login at: http://localhost:5000/login\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });
