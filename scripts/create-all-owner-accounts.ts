import "dotenv/config";
import { db } from "../server/db";
import { users, units } from "@shared/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

/**
 * Create owner accounts for all 24 units
 * Username: owner{unitNumber} (e.g., owner201, owner202)
 * Password: heritage2025 (all owners use same initial password)
 */

async function createAllOwnerAccounts() {
  console.log("👥 Creating owner accounts for all units...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  try {
    // Get all units
    const allUnits = await db.select().from(units);
    console.log(`Found ${allUnits.length} units in database`);
    console.log("");

    // Hash the default password
    const defaultPassword = await bcrypt.hash("heritage2025", 10);

    let created = 0;
    let skipped = 0;

    for (const unit of allUnits) {
      const username = `owner${unit.unitNumber}`;
      const email = `owner${unit.unitNumber}@heritagecondo.com`;

      try {
        // Check if user already exists
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (existingUser.length > 0) {
          console.log(`⚠️  ${username.padEnd(10)} - Already exists (skipping)`);
          skipped++;
          continue;
        }

        // Create the owner account
        await db.insert(users).values({
          username,
          email,
          password: defaultPassword,
          role: "owner",
          unitId: unit.id,
          active: true,
          mustChangePassword: false,
        });

        console.log(`✅ ${username.padEnd(10)} - Created (Unit ${unit.unitNumber})`);
        created++;

      } catch (error: any) {
        console.error(`❌ Failed to create ${username}:`, error.message);
      }
    }

    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ Created: ${created} accounts`);
    console.log(`⚠️  Skipped: ${skipped} accounts (already exist)`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
    console.log("🔑 DEFAULT LOGIN CREDENTIALS FOR ALL OWNERS:");
    console.log("   Username: owner{UnitNumber} (e.g., owner201, owner301)");
    console.log("   Password: heritage2025");
    console.log("");
    console.log("Examples:");
    console.log("   Unit 201: owner201 / heritage2025");
    console.log("   Unit 202: owner202 / heritage2025");
    console.log("   Unit 301: owner301 / heritage2025");
    console.log("");

  } catch (error) {
    console.error("❌ Error creating owner accounts:", error);
    throw error;
  }
}

createAllOwnerAccounts()
  .then(() => {
    console.log("🎉 Owner accounts setup complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
