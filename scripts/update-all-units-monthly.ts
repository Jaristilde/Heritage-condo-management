import "dotenv/config";
import { db } from "../server/db";
import { units } from "@shared/schema";

/**
 * Update ALL units' monthly maintenance to correct amount: $578.45
 *
 * Heritage Condominium has standardized monthly maintenance across all 24 units.
 */

async function updateAllUnitsMonthly() {
  console.log("🔧 Updating ALL units' monthly maintenance to $578.45...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  try {
    // Get all units
    const allUnits = await db.select().from(units);

    console.log(`📋 Found ${allUnits.length} units in database`);
    console.log("");

    // Show current values
    console.log("Current monthly maintenance values:");
    allUnits.forEach(unit => {
      console.log(`   Unit ${unit.unitNumber}: $${unit.monthlyMaintenance}`);
    });
    console.log("");

    // Update all units to $578.45
    console.log("Updating all units to $578.45...");
    const result = await db
      .update(units)
      .set({
        monthlyMaintenance: "578.45",
      })
      .returning();

    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ SUCCESS! Updated ${result.length} units`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
    console.log("Updated units:");
    result.forEach(unit => {
      console.log(`   ✓ Unit ${unit.unitNumber}: $${unit.monthlyMaintenance}`);
    });
    console.log("");
    console.log("🎉 All units now have correct monthly maintenance!");
    console.log("");

  } catch (error) {
    console.error("❌ Error updating units:", error);
    throw error;
  }
}

updateAllUnitsMonthly()
  .then(() => {
    console.log("🚀 Update complete!");
    console.log("🌐 Refresh any open browser tabs to see the updated amounts");
    console.log("");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Update failed:", error);
    process.exit(1);
  });
