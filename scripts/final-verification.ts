import "dotenv/config";
import { db } from "../server/db";
import { users, units } from "@shared/schema";
import { like, eq } from "drizzle-orm";

/**
 * Final verification that all 24 owner accounts exist and are ready to use
 */

async function finalVerification() {
  console.log("🎯 FINAL VERIFICATION: All 24 Owner Logins");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  try {
    // Get all owner accounts
    const ownerAccounts = await db
      .select()
      .from(users)
      .where(like(users.username, "owner%"));

    console.log(`✅ Total owner accounts: ${ownerAccounts.length}/24`);
    console.log("");

    if (ownerAccounts.length < 24) {
      console.log("❌ MISSING ACCOUNTS - Expected 24 accounts");
      console.log("");
    }

    // Get all units with owner data
    const allUnits = await db.select().from(units);

    let withOwnerData = 0;
    let missingOwnerData = 0;

    console.log("📋 UNIT STATUS:");
    console.log("");

    for (const unit of allUnits.sort((a, b) => a.unitNumber.localeCompare(b.unitNumber))) {
      const ownerAccount = ownerAccounts.find(u => u.username === `owner${unit.unitNumber}`);

      if (!ownerAccount) {
        console.log(`❌ Unit ${unit.unitNumber}: NO USER ACCOUNT`);
        continue;
      }

      if (unit.ownerName) {
        console.log(`✅ Unit ${unit.unitNumber}: ${unit.ownerName}`);
        console.log(`   👤 Username: owner${unit.unitNumber}`);
        console.log(`   📧 Email: ${unit.ownerEmail || 'MISSING'}`);
        console.log(`   📱 Phone: ${unit.ownerPhone || 'MISSING'}`);
        console.log(`   💰 Balance: $${unit.totalOwed || '0.00'}`);
        console.log(`   🔑 Login: owner${unit.unitNumber} / Heritage2025!`);
        withOwnerData++;
      } else {
        console.log(`⚠️  Unit ${unit.unitNumber}: Account exists but NO OWNER DATA`);
        missingOwnerData++;
      }
      console.log("");
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 SUMMARY:");
    console.log(`   Total Units: ${allUnits.length}`);
    console.log(`   Owner Accounts: ${ownerAccounts.length}`);
    console.log(`   Units with Full Data: ${withOwnerData}`);
    console.log(`   Units Missing Data: ${missingOwnerData}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");

    if (ownerAccounts.length === 24 && withOwnerData === 24) {
      console.log("🎉 SUCCESS! All 24 owner accounts are ready!");
      console.log("");
      console.log("🔑 DEFAULT LOGIN CREDENTIALS:");
      console.log("   Username: owner{UnitNumber}");
      console.log("   Password: Heritage2025!");
      console.log("");
      console.log("Examples:");
      console.log("   Unit 201: owner201 / Heritage2025!");
      console.log("   Unit 202: owner202 / Heritage2025!");
      console.log("   Unit 301: owner301 / Heritage2025!");
      console.log("");
    } else {
      console.log("⚠️  Some units are incomplete. Review the status above.");
      console.log("");
    }

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

finalVerification()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
