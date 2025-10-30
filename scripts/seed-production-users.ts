import "dotenv/config";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { hashPassword } from "../server/auth";
import { eq } from "drizzle-orm";

/**
 * Production-safe user seeding script
 * This ensures demo users exist in production with correct passwords
 */

async function seedProductionUsers() {
  console.log("🔐 Seeding/Updating Production Users...");

  try {
    // User data with updated passwords
    const usersToSeed = [
      {
        username: "board",
        password: "board1806",
        role: "board_member",
        fullName: "Board Member Demo",
        email: "board@heritage-condo.com",
        phoneNumber: null,
      },
      {
        username: "management",
        password: "management1806",
        role: "management",
        fullName: "Jorge (Management)",
        email: "joanearistilde@gmail.com",
        phoneNumber: null,
      },
      {
        username: "owner201",
        password: "owner1806",
        role: "owner",
        fullName: "Unit 201 Owner",
        email: "owner201@heritage-condo.com",
        phoneNumber: null,
      },
    ];

    for (const userData of usersToSeed) {
      // Check if user exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, userData.username))
        .limit(1);

      const hashedPassword = await hashPassword(userData.password);

      if (existingUser.length > 0) {
        // Update existing user with new password
        await db
          .update(users)
          .set({
            password: hashedPassword,
            role: userData.role,
            fullName: userData.fullName,
            email: userData.email,
          })
          .where(eq(users.username, userData.username));

        console.log(`✅ Updated user: ${userData.username}`);
      } else {
        // Create new user
        await db.insert(users).values({
          username: userData.username,
          password: hashedPassword,
          role: userData.role as any,
          fullName: userData.fullName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
        });

        console.log(`✅ Created user: ${userData.username}`);
      }
    }

    console.log("\n🎉 Production users seeded successfully!");
    console.log("\n📝 Login Credentials:");
    console.log("Board:      board / board1806");
    console.log("Management: management / management1806");
    console.log("Owner:      owner201 / owner1806");

  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  }

  process.exit(0);
}

seedProductionUsers();
