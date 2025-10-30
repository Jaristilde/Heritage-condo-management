import "dotenv/config";
import { db } from "../server/db";
import { units } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Seed SA#1 (Popular Loan) July 2025 Payment Data
 *
 * Units WITH SA#1 ($208 charge):
 * - PAID: 202, 203, 205, 208, 301, 303
 * - UNPAID: 204, 305, 308, 401, 402, 405
 *
 * Units WITHOUT SA#1 ($0 - Paid Off):
 * - 201, 206, 207, 302, 304, 306, 307, 403, 404, 406, 407, 408
 */

async function seedJulySA1Payments() {
  console.log("🔄 Updating SA#1 July 2025 payment data...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Units that PAID their $208 July SA#1 charge
  const paidUnits = ['202', '203', '205', '208', '301', '303'];

  // Units that DID NOT PAY their $208 July SA#1 charge
  const unpaidUnits = ['204', '305', '308', '401', '402', '405'];

  // Units WITHOUT SA#1 (Paid Off)
  const paidOffUnits = ['201', '206', '207', '302', '304', '306', '307', '403', '404', '406', '407', '408'];

  let updated = 0;

  // Update PAID units ($208 payment)
  for (const unitNumber of paidUnits) {
    await db.update(units)
      .set({
        hasPopularLoan: true,
        sa1MonthlyCharge: "208.00",
        sa1PaymentJuly: "208.00",
        sa1Paid: true,
        sa1Status: "On-going",
      })
      .where(eq(units.unitNumber, unitNumber));
    console.log(`✅ Unit ${unitNumber}: $208 PAID`);
    updated++;
  }

  // Update UNPAID units ($0 payment)
  for (const unitNumber of unpaidUnits) {
    await db.update(units)
      .set({
        hasPopularLoan: true,
        sa1MonthlyCharge: "208.00",
        sa1PaymentJuly: "0",
        sa1Paid: false,
        sa1Status: "On-going",
      })
      .where(eq(units.unitNumber, unitNumber));
    console.log(`🚩 Unit ${unitNumber}: $208 UNPAID`);
    updated++;
  }

  // Update PAID OFF units ($0 - no loan)
  for (const unitNumber of paidOffUnits) {
    await db.update(units)
      .set({
        hasPopularLoan: false,
        sa1MonthlyCharge: "0",
        sa1PaymentJuly: "0",
        sa1Paid: true, // Paid in full, loan is done
        sa1Status: "Paid Off",
      })
      .where(eq(units.unitNumber, unitNumber));
    console.log(`✅ Unit ${unitNumber}: $0 (PAID OFF)`);
    updated++;
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 SUMMARY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Total Units: ${updated}`);
  console.log(`With SA#1: 12 units`);
  console.log(`  ✅ Paid July ($208): ${paidUnits.length} units`);
  console.log(`  🚩 Unpaid July: ${unpaidUnits.length} units`);
  console.log(`Without SA#1 (Paid Off): ${paidOffUnits.length} units`);
  console.log(`Collection Rate: ${(paidUnits.length / 12 * 100).toFixed(0)}%`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ SA#1 July 2025 data updated successfully!");
}

seedJulySA1Payments()
  .then(() => {
    console.log("\n🎉 Seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });
