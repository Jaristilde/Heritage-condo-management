import "dotenv/config";
import { db } from "../server/db";
import { users, units } from "@shared/schema";
import { like, eq } from "drizzle-orm";

/**
 * Debug why payment page fails for units 202-204
 */

async function debugPaymentIssue() {
  console.log("🔍 Debugging Payment Page Issue");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  try {
    // Check the specific units that are having issues
    const problematicUnits = ["201", "202", "203", "204"];

    console.log("📋 Checking Units Table:");
    console.log("");

    for (const unitNum of problematicUnits) {
      const unitData = await db
        .select()
        .from(units)
        .where(eq(units.unitNumber, unitNum))
        .limit(1);

      if (unitData.length > 0) {
        console.log(`Unit ${unitNum}:`);
        console.log(`  ID: ${unitData[0].id}`);
        console.log(`  Unit Number: ${unitData[0].unitNumber}`);
        console.log(`  Owner Name: ${unitData[0].ownerName || "MISSING"}`);
        console.log(`  Total Owed: ${unitData[0].totalOwed || "0.00"}`);
        console.log("");
      } else {
        console.log(`❌ Unit ${unitNum} NOT FOUND in units table`);
        console.log("");
      }
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👤 Checking Users Table:");
    console.log("");

    for (const unitNum of problematicUnits) {
      const username = `owner${unitNum}`;
      const userData = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (userData.length > 0) {
        const user = userData[0];
        console.log(`User ${username}:`);
        console.log(`  User ID: ${user.id}`);
        console.log(`  Username: ${user.username}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Unit ID: ${user.unitId || "❌ NOT SET"}`);
        console.log(`  Active: ${user.active}`);

        // Check if unitId matches a real unit
        if (user.unitId) {
          const matchingUnit = await db
            .select()
            .from(units)
            .where(eq(units.id, user.unitId))
            .limit(1);

          if (matchingUnit.length > 0) {
            console.log(`  ✅ Unit ID matches Unit ${matchingUnit[0].unitNumber}`);
          } else {
            console.log(`  ❌ Unit ID does NOT match any unit!`);
          }
        }
        console.log("");
      } else {
        console.log(`❌ User ${username} NOT FOUND in users table`);
        console.log("");
      }
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 DIAGNOSIS:");
    console.log("");

    // Run comparison
    for (const unitNum of problematicUnits) {
      const username = `owner${unitNum}`;
      const unitData = await db.select().from(units).where(eq(units.unitNumber, unitNum)).limit(1);
      const userData = await db.select().from(users).where(eq(users.username, username)).limit(1);

      if (unitData.length > 0 && userData.length > 0) {
        const unit = unitData[0];
        const user = userData[0];

        if (user.unitId === unit.id) {
          console.log(`✅ ${username}: Unit ID matches correctly`);
        } else {
          console.log(`❌ ${username}: MISMATCH!`);
          console.log(`   User's unitId: ${user.unitId}`);
          console.log(`   Actual unit ID: ${unit.id}`);
          console.log(`   👉 FIX NEEDED: Update user's unitId to "${unit.id}"`);
        }
      } else {
        console.log(`❌ ${username}: Missing user or unit data`);
      }
    }

    console.log("");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

debugPaymentIssue()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
