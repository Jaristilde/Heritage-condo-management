import { config } from "dotenv";
config();

import { db } from "../server/db";
import { units } from "../shared/schema";

async function checkData() {
  const allUnits = await db.select({
    unitNumber: units.unitNumber,
    monthlyPopularLoan: units.monthlyPopularLoan,
    assessment2024Status: units.assessment2024Status,
    assessment2024Remaining: units.assessment2024Remaining,
    assessment2024Paid: units.assessment2024Paid,
    totalOwed: units.totalOwed
  }).from(units).orderBy(units.unitNumber);

  console.log('Sample units (202, 205, 208, 305, 308, 405):');
  const samples = allUnits.filter(u => ['202', '205', '208', '305', '308', '405'].includes(u.unitNumber));
  console.table(samples);

  console.log('\nAll units:');
  console.table(allUnits);
}

checkData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
