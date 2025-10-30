import "dotenv/config";
import { db } from "../server/db";
import { units } from "../shared/schema";
import { asc } from "drizzle-orm";

async function checkMaintenanceBalances() {
  console.log("🔍 Checking Maintenance Prior Balances...\n");

  try {
    const allUnits = await db
      .select({
        unitNumber: units.unitNumber,
        maintenancePriorBalance: units.maintenancePriorBalance,
        maintenancePaymentJuly: units.maintenancePaymentJuly,
        maintenanceBalance: units.maintenanceBalance,
        maintenancePaid: units.maintenancePaid,
      })
      .from(units)
      .orderBy(asc(units.unitNumber));

    console.log("Unit | Prior Balance | July Payment | New Balance | Paid?");
    console.log("-----|---------------|--------------|-------------|------");

    allUnits.forEach(unit => {
      const prior = parseFloat(unit.maintenancePriorBalance || "0");
      const payment = parseFloat(unit.maintenancePaymentJuly || "0");
      const balance = parseFloat(unit.maintenanceBalance || "0");
      const paid = unit.maintenancePaid ? "✅" : "❌";

      console.log(
        `${unit.unitNumber.padEnd(4)} | $${prior.toFixed(2).padStart(11)} | $${payment.toFixed(2).padStart(10)} | $${balance.toFixed(2).padStart(9)} | ${paid}`
      );
    });

    console.log("\n✅ Check complete!");
  } catch (error) {
    console.error("❌ Error:", error);
  }

  process.exit(0);
}

checkMaintenanceBalances();
