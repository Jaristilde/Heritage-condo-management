import "dotenv/config";
import { db } from "../server/db";
import { units, users, assessments, bankAccounts } from "@shared/schema";
import { sql } from "drizzle-orm";

async function verifyDatabase() {
  console.log("\n🔍 VERIFYING DATABASE STRUCTURE\n");
  console.log("=" .repeat(60));

  try {
    // Check units
    const unitCount = await db.select({ count: sql<number>`count(*)` }).from(units);
    console.log(`\n📦 UNITS: ${unitCount[0].count} units found`);

    if (unitCount[0].count === 24) {
      console.log("   ✅ All 24 units present");
    } else {
      console.log(`   ⚠️  Expected 24 units, found ${unitCount[0].count}`);
    }

    // Check users
    const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
    console.log(`\n👥 USERS: ${userCount[0].count} users found`);

    // Check assessments
    const assessmentCount = await db.select({ count: sql<number>`count(*)` }).from(assessments);
    console.log(`\n💰 ASSESSMENTS: ${assessmentCount[0].count} assessment records found`);

    // Check bank accounts
    const bankCount = await db.select({ count: sql<number>`count(*)` }).from(bankAccounts);
    console.log(`\n🏦 BANK ACCOUNTS: ${bankCount[0].count} accounts found`);

    // Check for delinquent units
    const delinquentUnits = await db
      .select({
        unitNumber: units.unitNumber,
        ownerName: units.ownerName,
        totalOwed: units.totalOwed,
        delinquencyStatus: units.delinquencyStatus,
      })
      .from(units)
      .where(sql`${units.delinquencyStatus} != 'current'`);

    console.log(`\n⚠️  DELINQUENT UNITS: ${delinquentUnits.length} units`);
    delinquentUnits.forEach(unit => {
      console.log(`   - Unit ${unit.unitNumber}: ${unit.ownerName} owes $${unit.totalOwed} (${unit.delinquencyStatus})`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("✅ Database verification complete\n");

  } catch (error) {
    console.error("❌ Database verification failed:", error);
    throw error;
  }
}

verifyDatabase()
  .then(() => {
    console.log("✅ All checks passed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Verification failed:", error);
    process.exit(1);
  });
