import "dotenv/config";
import { db } from "../server/db";
import { users, units } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Check owner access - why owner201 works but others don't
 *
 * This will verify:
 * 1. User exists and is active
 * 2. User has unitId
 * 3. Unit exists and is accessible
 * 4. Compare owner201 vs owner202 to find differences
 */

async function checkOwnerAccess() {
  console.log("🔍 Checking Owner Access Differences");
  console.log("=".repeat(70));

  const workingOwner = "owner201"; // WORKS ✅
  const brokenOwners = ["owner202", "owner203", "owner204", "owner405"]; // BROKEN ❌

  // Check working owner
  console.log(`\n✅ WORKING OWNER: ${workingOwner}`);
  console.log("-".repeat(70));

  const workingUser = await db
    .select()
    .from(users)
    .where(eq(users.username, workingOwner))
    .limit(1);

  if (workingUser.length > 0) {
    const user = workingUser[0];
    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Unit ID: ${user.unitId}`);
    console.log(`Active: ${user.active}`);
    console.log(`Must Change Password: ${user.mustChangePassword}`);
    console.log(`Phone: ${user.phoneNumber || "Not set"}`);
    console.log(`Full Name: ${user.fullName || "Not set"}`);
    console.log(`Created: ${user.createdAt}`);
    console.log(`Updated: ${user.updatedAt || "Not set"}`);

    if (user.unitId) {
      const unit = await db
        .select()
        .from(units)
        .where(eq(units.id, user.unitId))
        .limit(1);

      if (unit.length > 0) {
        console.log(`\nUnit: ${unit[0].unitNumber}`);
        console.log(`Owner Name: ${unit[0].ownerName}`);
      }
    }
  }

  // Check each broken owner
  for (const ownerUsername of brokenOwners) {
    console.log(`\n❌ BROKEN OWNER: ${ownerUsername}`);
    console.log("-".repeat(70));

    const brokenUser = await db
      .select()
      .from(users)
      .where(eq(users.username, ownerUsername))
      .limit(1);

    if (brokenUser.length === 0) {
      console.log(`User not found in database!`);
      continue;
    }

    const user = brokenUser[0];
    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Unit ID: ${user.unitId}`);
    console.log(`Active: ${user.active}`);
    console.log(`Must Change Password: ${user.mustChangePassword}`);
    console.log(`Phone: ${user.phoneNumber || "Not set"}`);
    console.log(`Full Name: ${user.fullName || "Not set"}`);
    console.log(`Created: ${user.createdAt}`);
    console.log(`Updated: ${user.updatedAt || "Not set"}`);

    if (user.unitId) {
      const unit = await db
        .select()
        .from(units)
        .where(eq(units.id, user.unitId))
        .limit(1);

      if (unit.length > 0) {
        console.log(`\nUnit: ${unit[0].unitNumber}`);
        console.log(`Owner Name: ${unit[0].ownerName}`);
      }
    }

    // Compare with working owner
    console.log(`\n🔬 Comparison with ${workingOwner}:`);
    if (workingUser.length > 0) {
      const differences = [];

      if (user.active !== workingUser[0].active) {
        differences.push(`Active status different: ${user.active} vs ${workingUser[0].active}`);
      }
      if ((user.unitId === null) !== (workingUser[0].unitId === null)) {
        differences.push(`Unit ID presence different: ${user.unitId ? 'has' : 'missing'} vs ${workingUser[0].unitId ? 'has' : 'missing'}`);
      }
      if (user.role !== workingUser[0].role) {
        differences.push(`Role different: ${user.role} vs ${workingUser[0].role}`);
      }
      if ((user.mustChangePassword || false) !== (workingUser[0].mustChangePassword || false)) {
        differences.push(`Must change password different: ${user.mustChangePassword} vs ${workingUser[0].mustChangePassword}`);
      }

      if (differences.length > 0) {
        console.log(`DIFFERENCES FOUND:`);
        differences.forEach(diff => console.log(`   - ${diff}`));
      } else {
        console.log(`No differences found - database records look identical!`);
        console.log(`⚠️  The issue must be elsewhere (frontend, routing, etc.)`);
      }
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("\n💡 HYPOTHESIS:");
  console.log("If all database records look the same, the issue is likely:");
  console.log("1. Frontend routing problem");
  console.log("2. Browser localStorage cache issue");
  console.log("3. Different URLs being accessed");
  console.log("4. Session/cookie issue");
  console.log("\nNEXT STEPS:");
  console.log("1. Clear browser cache and localStorage");
  console.log("2. Try logging in with owner202 in incognito mode");
  console.log("3. Check browser console for errors");
  console.log("4. Verify the exact URL being accessed");
}

checkOwnerAccess()
  .then(() => {
    console.log("\n✅ Check complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Check failed:", error);
    process.exit(1);
  });
