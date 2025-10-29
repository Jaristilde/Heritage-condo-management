import "dotenv/config";
import { db } from "../server/db";
import { units } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Update Unit 201 monthly maintenance to correct amount: $578.45
 */

async function updateUnit201Monthly() {
  console.log("🔧 Updating Unit 201 monthly maintenance...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // Find Unit 201
    const unit201Array = await db
      .select()
      .from(units)
      .where(eq(units.unitNumber, "201"))
      .limit(1);

    if (unit201Array.length === 0) {
      console.error("❌ Unit 201 not found!");
      process.exit(1);
    }

    const unit201 = unit201Array[0];
    console.log(`✅ Found Unit 201 (ID: ${unit201.id})`);
    console.log(`   Current Monthly Maintenance: $${unit201.monthlyMaintenance}`);
    console.log("");

    // Update monthly maintenance to $578.45
    const result = await db
      .update(units)
      .set({
        monthlyMaintenance: "578.45",
      })
      .where(eq(units.unitNumber, "201"))
      .returning();

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ SUCCESS! Unit 201 updated");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
    console.log(`Updated Unit 201:`);
    console.log(`   Unit Number: ${result[0].unitNumber}`);
    console.log(`   Monthly Maintenance: $${result[0].monthlyMaintenance}`);
    console.log("");
    console.log("🎉 Now login as owner201 to see the updated amount!");
    console.log("");

  } catch (error) {
    console.error("❌ Error updating Unit 201:", error);
    throw error;
  }
}

updateUnit201Monthly()
  .then(() => {
    console.log("🚀 Update complete!");
    console.log("🌐 Login at: http://localhost:5001/login");
    console.log("");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Update failed:", error);
    process.exit(1);
  });
