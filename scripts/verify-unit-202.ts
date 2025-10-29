import "dotenv/config";
import { db } from "../server/db";
import { users, units, owners } from "@shared/schema";
import { eq } from "drizzle-orm";

async function verifyUnit202() {
  console.log("🔍 Verifying Unit 202 setup...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  // Get Unit 202
  const unit202Array = await db
    .select()
    .from(units)
    .where(eq(units.unitNumber, "202"))
    .limit(1);

  if (unit202Array.length === 0) {
    console.error("❌ Unit 202 not found!");
    process.exit(1);
  }

  const unit202 = unit202Array[0];

  console.log("📋 Unit 202 Data:");
  console.log(`   Unit Number: ${unit202.unitNumber}`);
  console.log(`   Monthly Maintenance: $${unit202.monthlyMaintenance}`);
  console.log(`   Loan Popular Balance: $${unit202.firstAssessmentBalance}`);
  console.log(`   2024 Special Assessment: $${unit202.secondAssessmentBalance}`);
  console.log(`   Total Owed: $${unit202.totalOwed}`);
  console.log(`   Status: ${unit202.delinquencyStatus}`);
  console.log("");

  // Get owner202 user
  const owner202Array = await db
    .select()
    .from(users)
    .where(eq(users.username, "owner202"))
    .limit(1);

  if (owner202Array.length > 0) {
    const owner202 = owner202Array[0];
    console.log("👤 owner202 User:");
    console.log(`   Username: ${owner202.username}`);
    console.log(`   Email: ${owner202.email}`);
    console.log(`   Role: ${owner202.role}`);
    console.log(`   Unit ID: ${owner202.unitId}`);
    console.log(`   Linked to Unit 202: ${owner202.unitId === unit202.id ? "✅ YES" : "❌ NO"}`);
    console.log("");
  }

  // Get owner record
  const ownerRecordArray = await db
    .select()
    .from(owners)
    .where(eq(owners.unitId, unit202.id))
    .limit(1);

  if (ownerRecordArray.length > 0) {
    const ownerRecord = ownerRecordArray[0];
    console.log("📇 Owner Record:");
    console.log(`   Name: ${ownerRecord.fullName}`);
    console.log(`   Email: ${ownerRecord.email}`);
    console.log(`   Phone: ${ownerRecord.phone}`);
    console.log(`   Address: ${ownerRecord.mailingAddress}`);
    console.log(`   Status: ${ownerRecord.status}`);
    console.log("");
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Verification complete!");
  console.log("");
  console.log("You can now login at: http://localhost:5001/login");
  console.log("   Username: owner202");
  console.log("   Password: owner123");
  console.log("");

  process.exit(0);
}

verifyUnit202().catch((error) => {
  console.error("❌ Verification failed:", error);
  process.exit(1);
});
