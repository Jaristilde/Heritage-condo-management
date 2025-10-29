import "dotenv/config";
import { db } from "../server/db";
import { users, units, owners } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

/**
 * Setup Unit 203 with proper Heritage Condo data
 *
 * Financial Details:
 * - Monthly Maintenance: $578.45
 * - Loan Popular: $208.00
 * - 2024 Special Assessment Balance: $6,674.46 (on payment plan)
 * - Total Balance: $7,460.91
 */

async function setupUnit203() {
  console.log("🏢 Setting up Unit 203...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  try {
    // STEP 1: Find or Create Unit 203
    console.log("Step 1: Finding Unit 203...");
    let unit203Array = await db
      .select()
      .from(units)
      .where(eq(units.unitNumber, "203"))
      .limit(1);

    let unit203;

    if (unit203Array.length === 0) {
      console.log("⚠️  Unit 203 not found. Creating it...");

      const newUnit = await db
        .insert(units)
        .values({
          unitNumber: "203",
          monthlyMaintenance: "578.45",
          maintenanceBalance: "578.45",
          firstAssessmentStatus: "owed",
          firstAssessmentBalance: "208.00",
          secondAssessmentStatus: "plan", // On payment plan
          secondAssessmentBalance: "6674.46",
          totalOwed: "7460.91", // 578.45 + 208.00 + 6674.46
          delinquencyStatus: "current",
          priorityLevel: "medium",
        })
        .returning();

      unit203 = newUnit[0];
      console.log(`✅ Unit 203 created (ID: ${unit203.id})`);
    } else {
      unit203 = unit203Array[0];
      console.log(`✅ Found Unit 203 (ID: ${unit203.id})`);

      // Update existing unit with correct data
      console.log("   Updating Unit 203 financial data...");
      const updated = await db
        .update(units)
        .set({
          monthlyMaintenance: "578.45",
          maintenanceBalance: "578.45",
          firstAssessmentStatus: "owed",
          firstAssessmentBalance: "208.00",
          secondAssessmentStatus: "plan", // On payment plan
          secondAssessmentBalance: "6674.46",
          totalOwed: "7460.91",
          delinquencyStatus: "current",
          priorityLevel: "medium",
        })
        .where(eq(units.unitNumber, "203"))
        .returning();

      unit203 = updated[0];
      console.log("   ✅ Unit 203 updated with correct balances");
    }
    console.log("");

    // STEP 2: Create or Update owner203 User
    console.log("Step 2: Setting up owner203 user...");
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, "owner203"))
      .limit(1);

    if (existingUser.length === 0) {
      console.log("   Creating owner203 user account...");
      const hashedPassword = await bcrypt.hash("owner123", 10);

      await db
        .insert(users)
        .values({
          username: "owner203",
          password: hashedPassword,
          email: "owner203@heritage-hoa.com",
          role: "owner",
          unitId: unit203.id,
        });

      console.log("   ✅ owner203 user created");
    } else {
      console.log("   ⚠️  owner203 user already exists. Updating link to Unit 203...");
      await db
        .update(users)
        .set({ unitId: unit203.id })
        .where(eq(users.username, "owner203"));

      console.log("   ✅ owner203 linked to Unit 203");
    }
    console.log("");

    // STEP 3: Create or Update Owner Record
    console.log("Step 3: Creating owner record in owners table...");
    const existingOwner = await db
      .select()
      .from(owners)
      .where(eq(owners.unitId, unit203.id))
      .limit(1);

    if (existingOwner.length === 0) {
      console.log("   Creating new owner record...");
      await db
        .insert(owners)
        .values({
          unitId: unit203.id,
          fullName: "Unit 203 Owner",
          email: "owner203@heritage-hoa.com",
          phone: "(305) 555-0203",
          mailingAddress: "645 NE 121st Street, Unit 203, North Miami Beach, FL 33162",
          isPrimary: true,
          status: "active",
        });

      console.log("   ✅ Owner record created");
    } else {
      console.log("   ⚠️  Owner record already exists. Updating...");
      await db
        .update(owners)
        .set({
          fullName: "Unit 203 Owner",
          email: "owner203@heritage-hoa.com",
          phone: "(305) 555-0203",
          mailingAddress: "645 NE 121st Street, Unit 203, North Miami Beach, FL 33162",
          isPrimary: true,
          status: "active",
        })
        .where(eq(owners.unitId, unit203.id));

      console.log("   ✅ Owner record updated");
    }
    console.log("");

    // SUCCESS SUMMARY
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ SUCCESS! Unit 203 is ready");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
    console.log("📊 Financial Summary:");
    console.log(`   Monthly Maintenance:     $${unit203.monthlyMaintenance}`);
    console.log(`   Loan Popular:            $${unit203.firstAssessmentBalance}`);
    console.log(`   2024 Special Assessment: $${unit203.secondAssessmentBalance}`);
    console.log(`   ────────────────────────────────────`);
    console.log(`   Total Balance Due:       $${unit203.totalOwed}`);
    console.log("");
    console.log("💳 Payment Plan Details:");
    console.log("   3-Year Special Assessment Payment Plan");
    console.log("   Total Original: $11,920.83");
    console.log("   Monthly Payment: $331.13");
    console.log(`   Remaining Balance: $${unit203.secondAssessmentBalance}`);
    console.log("");
    console.log("🔐 Login Credentials:");
    console.log("   Username: owner203");
    console.log("   Password: owner123");
    console.log("");
    console.log("✅ The payment dropdown will show THREE options:");
    console.log("   1. ○ Monthly Maintenance - $578.45");
    console.log("   2. ○ Loan Popular Assessment - $208.00");
    console.log("   3. ○ 2024 Special Assessment - $331.13/month (Balance: $6,674.46)");
    console.log("");

  } catch (error) {
    console.error("❌ Error setting up Unit 203:", error);
    throw error;
  }
}

setupUnit203()
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
