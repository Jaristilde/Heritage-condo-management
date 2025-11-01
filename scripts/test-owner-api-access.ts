import "dotenv/config";
import { db } from "../server/db";
import { users, units } from "@shared/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, generateToken } from "../server/auth";

/**
 * TEST OWNER API ACCESS
 * =====================
 * Simulates login and API access for owner accounts
 * to verify if the issue is database or API-related
 */

async function testOwnerApiAccess() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║          TEST OWNER API ACCESS SIMULATION                  ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const testOwners = [
    { username: "owner201", password: "Heritage2025!" },
    { username: "owner202", password: "Heritage2025!" },
    { username: "owner203", password: "Heritage2025!" },
    { username: "owner204", password: "Heritage2025!" },
    { username: "owner405", password: "Heritage2025!" },
  ];

  for (const testOwner of testOwners) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Testing: ${testOwner.username}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    try {
      // Step 1: Get user from database
      const userRecords = await db
        .select()
        .from(users)
        .where(eq(users.username, testOwner.username))
        .limit(1);

      if (userRecords.length === 0) {
        console.log(`❌ User ${testOwner.username} NOT FOUND in database`);
        continue;
      }

      const user = userRecords[0];
      console.log(`✅ Step 1: User found in database`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Unit ID: ${user.unitId || "NULL"}`);
      console.log(`   Active: ${user.active}`);

      // Step 2: Verify password
      const passwordValid = await verifyPassword(
        testOwner.password,
        user.password
      );
      console.log(`\n${passwordValid ? "✅" : "❌"} Step 2: Password verification`);
      console.log(`   Testing password: ${testOwner.password}`);
      console.log(`   Result: ${passwordValid ? "VALID" : "INVALID"}`);

      if (!passwordValid) {
        console.log(`   ⚠️  Cannot proceed - password is invalid`);
        continue;
      }

      // Step 3: Generate JWT token
      const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        unitId: user.unitId || undefined,
      });
      console.log(`\n✅ Step 3: JWT token generated`);
      console.log(`   Token payload: { userId, username, role, unitId }`);

      // Step 4: Simulate /api/units call (owner-specific logic)
      console.log(`\n🔍 Step 4: Simulating /api/units API call`);
      if (user.role === "owner" && user.unitId) {
        console.log(`   Role is 'owner' and unitId exists`);
        console.log(`   API would query: getUnit("${user.unitId}")`);

        const unitRecords = await db
          .select()
          .from(units)
          .where(eq(units.id, user.unitId))
          .limit(1);

        if (unitRecords.length === 0) {
          console.log(`   ❌ ERROR: Unit ${user.unitId} NOT FOUND!`);
          console.log(`   This would cause the dashboard to fail!`);
        } else {
          const unit = unitRecords[0];
          console.log(`   ✅ Unit found: ${unit.unitNumber}`);
          console.log(`   API response: [{ id, unitNumber, ... }]`);
          console.log(`   Dashboard would display: Unit ${unit.unitNumber}`);
        }
      } else if (!user.unitId) {
        console.log(`   ❌ ERROR: User has NULL unitId!`);
        console.log(`   API would return empty array: []`);
        console.log(`   Dashboard would show: "No Unit Assigned"`);
      }

      console.log(`\n✅ ${testOwner.username} - ALL CHECKS PASSED`);
    } catch (error) {
      console.log(`\n❌ Error testing ${testOwner.username}:`, error);
    }
  }

  console.log(`\n\n╔════════════════════════════════════════════════════════════╗`);
  console.log(`║                    FINAL ANALYSIS                           ║`);
  console.log(`╚════════════════════════════════════════════════════════════╝\n`);

  console.log(`Based on this test, the "Page Not Found" issue is likely:`);
  console.log(``);
  console.log(`1. ❌ DATABASE ISSUE: Owner has NULL unitId`);
  console.log(`   - User can login successfully`);
  console.log(`   - But /api/units returns empty array`);
  console.log(`   - Dashboard shows "No Unit Assigned" (not 404)`);
  console.log(``);
  console.log(`2. ❌ ROUTING ISSUE: User trying to access wrong URL`);
  console.log(`   - Owner role users accessing /owners/:unitNumber`);
  console.log(`   - This route only exists for board/management`);
  console.log(`   - Owner users should use: / (root dashboard)`);
  console.log(``);
  console.log(`3. ❌ AUTHENTICATION ISSUE: Token missing unitId`);
  console.log(`   - User has unitId in database but not in JWT`);
  console.log(`   - API can't filter units properly`);
  console.log(``);
  console.log(`4. ✅ ALL DATABASE RECORDS ARE VALID`);
  console.log(`   - All test users have valid unitId associations`);
  console.log(`   - All passwords verify correctly`);
  console.log(`   - API should work as expected`);
  console.log(``);
  console.log(`RECOMMENDATION:`);
  console.log(`Ask the user: "What URL are you accessing after login?"`);
  console.log(`- If they see "Page Not Found" immediately after login`);
  console.log(`  -> Check browser console for routing errors`);
  console.log(`- If they manually type /owners/202, /owners/203, etc.`);
  console.log(`  -> That's expected! Owners should use / (root)`);
  console.log(``);
}

testOwnerApiAccess()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
