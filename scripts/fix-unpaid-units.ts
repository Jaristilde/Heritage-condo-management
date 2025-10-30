import { config } from "dotenv";
config();

import { db } from "../server/db";
import { units } from "../shared/schema";
import { eq } from "drizzle-orm";

async function fixUnpaidUnits() {
  console.log("Fixing UNPAID units to show correct $11,920.92 assessment remaining...\n");

  const unpaidUnits = ['204', '305', '308'];

  for (const unitNum of unpaidUnits) {
    await db
      .update(units)
      .set({
        assessment2024Remaining: "11920.92",
      })
      .where(eq(units.unitNumber, unitNum));

    console.log(`✅ Fixed Unit ${unitNum}: assessment2024Remaining = $11,920.92`);
  }

  console.log("\n✅ All UNPAID units corrected!");
}

fixUnpaidUnits()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
