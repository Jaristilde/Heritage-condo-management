import "dotenv/config";
import { db } from "../server/db";
import { users } from "@shared/schema";
import { or, eq } from "drizzle-orm";

/**
 * Check multi-unit owners and their account status
 */

async function checkMultiUnitOwners() {
  console.log("🔍 Checking multi-unit owner accounts...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  try {
    // Check for the three problematic units
    const problematicUnits = ["owner205", "owner208", "owner406", "owner201"];

    const accounts = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.username, "owner205"),
          eq(users.username, "owner208"),
          eq(users.username, "owner406"),
          eq(users.username, "owner201")
        )
      );

    console.log(`Found ${accounts.length} accounts:`);
    console.log("");

    for (const account of accounts) {
      console.log(`Username: ${account.username}`);
      console.log(`Email: ${account.email}`);
      console.log(`Unit ID: ${account.unitId}`);
      console.log(`Active: ${account.active}`);
      console.log("");
    }

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

checkMultiUnitOwners()
  .then(() => {
    console.log("✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
