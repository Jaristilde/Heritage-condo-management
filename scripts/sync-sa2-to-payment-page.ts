import "dotenv/config";
import { db } from "../server/db";
import { units } from "@shared/schema";
import { sql } from "drizzle-orm";

/**
 * SYNC SA2 BALANCES TO PAYMENT PAGE
 *
 * This script copies assessment2024Remaining to secondAssessmentBalance
 * so that the SA2 payment option appears on the owner payment page.
 */

async function syncSA2ToPaymentPage() {
  console.log("🔄 Syncing SA2 Assessment Balances to Payment Page");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  try {
    // First, check if secondAssessmentBalance column exists
    console.log("📋 Step 1: Ensuring secondAssessmentBalance column exists...");
    try {
      await db.execute(sql`
        ALTER TABLE units
        ADD COLUMN IF NOT EXISTS second_assessment_balance TEXT DEFAULT '0.00'
      `);
      console.log("✅ Column exists or created");
    } catch (error: any) {
      console.log("⚠️  Column may already exist:", error.message);
    }
    console.log("");

    // Now sync the data: copy assessment2024Remaining to secondAssessmentBalance
    console.log("📋 Step 2: Syncing assessment2024Remaining to secondAssessmentBalance...");
    console.log("");

    const result = await db.execute(sql`
      UPDATE units
      SET second_assessment_balance = assessment_2024_remaining,
          updated_at = NOW()
      WHERE assessment_2024_remaining IS NOT NULL
        AND CAST(assessment_2024_remaining AS DECIMAL) > 0
    `);

    console.log(`✅ Updated ${result.rowCount || 0} units with SA2 balances`);
    console.log("");

    // Verify the sync
    console.log("📋 Step 3: Verifying synced data...");
    console.log("");

    const allUnits = await db.select().from(units);
    const unitsWithSA2 = allUnits.filter(u =>
      u.secondAssessmentBalance && parseFloat(u.secondAssessmentBalance) > 0
    );

    console.log(`✅ ${unitsWithSA2.length} units now have SA2 balances on payment page`);
    console.log("");

    // Show details for key units
    console.log("📊 Key Units:");
    const keyUnits = ["202", "203", "204"];
    for (const unitNum of keyUnits) {
      const unit = allUnits.find(u => u.unitNumber === unitNum);
      if (unit) {
        console.log(`  Unit ${unitNum}:`);
        console.log(`    assessment2024Remaining: $${unit.assessment2024Remaining || "0.00"}`);
        console.log(`    secondAssessmentBalance: $${unit.secondAssessmentBalance || "0.00"}`);
        console.log(`    Status: ${unit.assessment2024Status || "UNKNOWN"}`);
        console.log("");
      }
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ SYNC COMPLETE!");
    console.log("");
    console.log("🎯 The SA2 payment option should now appear on the payment page");
    console.log("   for all units with outstanding 2024 Assessment balances.");
    console.log("");
    console.log("💡 Monthly SA2 payment amount: $331.13");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

syncSA2ToPaymentPage()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
