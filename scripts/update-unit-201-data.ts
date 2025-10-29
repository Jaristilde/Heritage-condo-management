import "dotenv/config";
import { db } from "../server/db";
import { units } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Update Unit 201 with proper Heritage Condo data
 *
 * From seed file, Unit 201 owner is:
 * - JOSE PEIRATS TRS - THE JOSE PEIRATS AND
 * - Email: peppeirats@gmail.com
 * - Phone: 786-319-8010
 * - Monthly Maintenance: $540.78 (updated from original $350)
 */

async function updateUnit201Data() {
  console.log("🔧 Updating Unit 201 with proper data...");
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
    console.log("");

    // Update Unit 201 with proper data
    const result = await db
      .update(units)
      .set({
        ownerName: "JOSE PEIRATS",
        ownerEmail: "peppeirats@gmail.com",
        ownerPhone: "786-319-8010",
        monthlyMaintenance: "540.78",
        totalOwed: "540.78", // Current month due
        delinquencyStatus: "current",
        status: "active",
        address: "645 NE 121st Street, Unit 201, North Miami Beach, FL 33162",
      })
      .where(eq(units.unitNumber, "201"))
      .returning();

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ SUCCESS! Unit 201 updated");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
    console.log(`Updated Unit 201:`);
    console.log(`   Unit Number: ${result[0].unitNumber}`);
    console.log(`   Owner Name:  ${result[0].ownerName}`);
    console.log(`   Email:       ${result[0].ownerEmail}`);
    console.log(`   Phone:       ${result[0].ownerPhone}`);
    console.log(`   Address:     ${result[0].address}`);
    console.log(`   Monthly:     $${result[0].monthlyMaintenance}`);
    console.log(`   Balance Due: $${result[0].totalOwed}`);
    console.log(`   Status:      ${result[0].delinquencyStatus}`);
    console.log("");
    console.log("🎉 Now login as owner201 to see:");
    console.log("   ✅ Unit 201 owner information");
    console.log("   ✅ Balance: $540.78");
    console.log("   ✅ Monthly maintenance breakdown");
    console.log("   ✅ Make payment form with all data");
    console.log("");

  } catch (error) {
    console.error("❌ Error updating Unit 201:", error);
    throw error;
  }
}

updateUnit201Data()
  .then(() => {
    console.log("🚀 Unit 201 updated successfully!");
    console.log("🌐 Login at: http://localhost:5001/login");
    console.log("   Username: owner201");
    console.log("   Password: owner123");
    console.log("");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Update failed:", error);
    process.exit(1);
  });
