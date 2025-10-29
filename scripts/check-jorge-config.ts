import "dotenv/config";
import { db } from "../server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function checkJorgeConfig() {
  console.log("Checking Jorge's (management) user configuration...");
  console.log("");

  const user = await db.select().from(users).where(eq(users.username, "management"));

  if (user.length === 0) {
    console.log("❌ Management user not found!");
    return;
  }

  console.log("Management User Details:");
  console.log(JSON.stringify(user[0], null, 2));
  console.log("");

  if (user[0].unitId) {
    console.log("⚠️  ISSUE FOUND: Management user has a unitId assigned!");
    console.log(`   This causes the system to treat Jorge as an owner of unit ${user[0].unitId}`);
    console.log(`   Jorge should have unitId: null to see all units`);
  } else {
    console.log("✅ Configuration looks correct - no unitId assigned");
  }
}

checkJorgeConfig()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
