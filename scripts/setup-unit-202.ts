import "dotenv/config";
import { db } from "../server/db";
import { users, units, owners } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

/**
 * Setup Unit 202 with proper Heritage Condo data
 *
 * Financial Details:
 * - Monthly Maintenance: $578.45
 * - Loan Popular: $208.00
 * - 2024 Special Assessment Balance: $6,856.07
 * - Total Balance: $7,642.52
 */

async function setupUnit202() {
  console.log("🏢 Setting up Unit 202...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  try {
    // STEP 1: Find or Create Unit 202
    console.log("Step 1: Finding Unit 202...");
    let unit202Array = await db
      .select()
      .from(units)
      .where(eq(units.unitNumber, "202"))
      .limit(1);

    let unit202;

    if (unit202Array.length === 0) {
      console.log("⚠️  Unit 202 not found. Creating it...");

      const newUnit = await db
        .insert(units)
        .values({
          unitNumber: "202",
          monthlyMaintenance: "578.45",
          maintenanceBalance: "578.45",
          firstAssessmentStatus: "owed",
          firstAssessmentBalance: "208.00",
          secondAssessmentStatus: "owed",
          secondAssessmentBalance: "6856.07",
          totalOwed: "7642.52", // 578.45 + 208.00 + 6856.07
          delinquencyStatus: "current",
          priorityLevel: "medium",
        })
        .returning();

      unit202 = newUnit[0];
      console.log(`✅ Unit 202 created (ID: ${unit202.id})`);
    } else {
      unit202 = unit202Array[0];
      console.log(`✅ Found Unit 202 (ID: ${unit202.id})`);

      // Update existing unit with correct data
      console.log("   Updating Unit 202 financial data...");
      const updated = await db
        .update(units)
        .set({
          monthlyMaintenance: "578.45",
          maintenanceBalance: "578.45",
          firstAssessmentStatus: "owed",
          firstAssessmentBalance: "208.00",
          secondAssessmentStatus: "owed",
          secondAssessmentBalance: "6856.07",
          totalOwed: "7642.52",
          delinquencyStatus: "current",
          priorityLevel: "medium",
        })
        .where(eq(units.unitNumber, "202"))
        .returning();

      unit202 = updated[0];
      console.log("   ✅ Unit 202 updated with correct balances");
    }
    console.log("");

    // STEP 2: Create or Update owner202 User
    console.log("Step 2: Setting up owner202 user...");
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, "owner202"))
      .limit(1);

    if (existingUser.length === 0) {
      console.log("   Creating owner202 user account...");
      const hashedPassword = await bcrypt.hash("owner123", 10);

      await db
        .insert(users)
        .values({
          username: "owner202",
          password: hashedPassword,
          email: "owner202@heritage-hoa.com",
          role: "owner",
          unitId: unit202.id,
        });

      console.log("   ✅ owner202 user created");
    } else {
      console.log("   ⚠️  owner202 user already exists. Updating link to Unit 202...");
      await db
        .update(users)
        .set({ unitId: unit202.id })
        .where(eq(users.username, "owner202"));

      console.log("   ✅ owner202 linked to Unit 202");
    }
    console.log("");

    // STEP 3: Create or Update Owner Record
    console.log("Step 3: Creating owner record in owners table...");
    const existingOwner = await db
      .select()
      .from(owners)
      .where(eq(owners.unitId, unit202.id))
      .limit(1);

    if (existingOwner.length === 0) {
      console.log("   Creating new owner record...");
      await db
        .insert(owners)
        .values({
          unitId: unit202.id,
          fullName: "Unit 202 Owner",
          email: "owner202@heritage-hoa.com",
          phone: "(305) 555-0202",
          mailingAddress: "645 NE 121st Street, Unit 202, North Miami Beach, FL 33162",
          isPrimary: true,
          status: "active",
        });

      console.log("   ✅ Owner record created");
    } else {
      console.log("   ⚠️  Owner record already exists. Updating...");
      await db
        .update(owners)
        .set({
          fullName: "Unit 202 Owner",
          email: "owner202@heritage-hoa.com",
          phone: "(305) 555-0202",
          mailingAddress: "645 NE 121st Street, Unit 202, North Miami Beach, FL 33162",
          isPrimary: true,
          status: "active",
        })
        .where(eq(owners.unitId, unit202.id));

      console.log("   ✅ Owner record updated");
    }
    console.log("");

    // SUCCESS SUMMARY
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ SUCCESS! Unit 202 is ready");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
    console.log("📊 Financial Summary:");
    console.log(`   Monthly Maintenance:     $${unit202.monthlyMaintenance}`);
    console.log(`   Loan Popular:            $${unit202.firstAssessmentBalance}`);
    console.log(`   2024 Special Assessment: $${unit202.secondAssessmentBalance}`);
    console.log(`   ────────────────────────────────────`);
    console.log(`   Total Balance Due:       $${unit202.totalOwed}`);
    console.log("");
    console.log("🔐 Login Credentials:");
    console.log("   Username: owner202");
    console.log("   Password: owner123");
    console.log("");
    console.log("✅ The payment dropdown will show THREE options:");
    console.log("   1. ○ Monthly Maintenance - $578.45");
    console.log("   2. ○ Loan Popular Assessment - $208.00");
    console.log("   3. ○ 2024 Special Assessment - $6,856.07");
    console.log("");

  } catch (error) {
    console.error("❌ Error setting up Unit 202:", error);
    throw error;
  }
}

setupUnit202()
  .then(() => {
    console.log("🚀 Setup complete!");
    console.log("🌐 Login at: http://localhost:5001/login");
    console.log("");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Setup failed:", error);
    process.exit(1);
  });
