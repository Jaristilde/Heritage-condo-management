import "dotenv/config";
import { db } from "../server/db";
import { units } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Check SA2 (Second Assessment) balances for units 202 and 203
 */

async function checkSA2Balances() {
  console.log("🔍 Checking SA2 Assessment Balances");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  try {
    const checkUnits = ["202", "203", "201", "204"];

    for (const unitNum of checkUnits) {
      const unitData = await db
        .select()
        .from(units)
        .where(eq(units.unitNumber, unitNum))
        .limit(1);

      if (unitData.length > 0) {
        const unit = unitData[0];
        console.log(`Unit ${unitNum}:`);
        console.log(`  Owner: ${unit.ownerName}`);
        console.log(`  Total Owed: $${unit.totalOwed || "0.00"}`);
        console.log(`  Monthly Maintenance: $${unit.monthlyMaintenance || "0.00"}`);
        console.log(`  First Assessment Balance (SA1): $${unit.firstAssessmentBalance || "0.00"}`);
        console.log(`  Second Assessment Balance (SA2): $${unit.secondAssessmentBalance || "0.00"}`);

        if (!unit.secondAssessmentBalance || parseFloat(unit.secondAssessmentBalance) <= 0) {
          console.log(`  ⚠️  SA2 balance is ZERO or NOT SET - payment option will NOT appear`);
        } else {
          console.log(`  ✅ SA2 balance is set - payment option should appear`);
        }
        console.log("");
      }
    }

    // Get all units with non-zero SA2 balances
    const allUnits = await db.select().from(units);
    const unitsWithSA2 = allUnits.filter(u =>
      u.secondAssessmentBalance && parseFloat(u.secondAssessmentBalance) > 0
    );

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📊 Summary: ${unitsWithSA2.length} units have SA2 balances`);
    console.log("");

    if (unitsWithSA2.length > 0) {
      console.log("Units with SA2 balances:");
      for (const unit of unitsWithSA2.sort((a, b) => a.unitNumber.localeCompare(b.unitNumber))) {
        console.log(`  Unit ${unit.unitNumber}: $${unit.secondAssessmentBalance}`);
      }
    } else {
      console.log("❌ NO UNITS have SA2 balances set!");
      console.log("   This is why the SA2 payment option is not appearing.");
    }
    console.log("");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

checkSA2Balances()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
