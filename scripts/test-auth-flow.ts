import "dotenv/config";
import { db } from "../server/db";
import { users, units } from "@shared/schema";
import { eq } from "drizzle-orm";
import { generateToken, verifyToken } from "../server/auth";

/**
 * Test Authentication Flow Investigation
 *
 * ISSUE: owner201 can access all pages, but owner202-204, 405 get "Page Not Found"
 *
 * This script will:
 * 1. Check the database for each owner user
 * 2. Simulate login and generate JWT tokens
 * 3. Decode tokens to verify unitId is included
 * 4. Compare working vs broken owners
 */

async function testAuthFlow() {
  console.log("🔐 Authentication Flow Investigation");
  console.log("=" .repeat(60));

  const testOwners = [
    "owner201", // WORKS ✅
    "owner202", // BROKEN ❌
    "owner203", // BROKEN ❌
    "owner204", // BROKEN ❌
    "owner405", // BROKEN ❌
  ];

  for (const username of testOwners) {
    console.log(`\n📋 Testing ${username}:`);
    console.log("-".repeat(60));

    // Step 1: Get user from database
    const userArray = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (userArray.length === 0) {
      console.log(`❌ User not found in database`);
      continue;
    }

    const user = userArray[0];

    console.log(`✅ User found in database:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Unit ID: ${user.unitId || "NULL ⚠️"}`);
    console.log(`   Active: ${user.active}`);

    // Step 2: Get associated unit if unitId exists
    if (user.unitId) {
      const unitArray = await db
        .select()
        .from(units)
        .where(eq(units.id, user.unitId))
        .limit(1);

      if (unitArray.length > 0) {
        const unit = unitArray[0];
        console.log(`\n   📍 Associated Unit:`);
        console.log(`      Unit Number: ${unit.unitNumber}`);
        console.log(`      Owner Name: ${unit.ownerName || "Not set"}`);
        console.log(`      Total Owed: $${unit.totalOwed}`);
      } else {
        console.log(`\n   ⚠️  Unit ID exists but unit not found!`);
      }
    } else {
      console.log(`\n   ❌ No Unit ID - THIS IS THE PROBLEM!`);
    }

    // Step 3: Simulate JWT token generation (what happens during login)
    console.log(`\n   🔑 Simulating Login - Generating JWT Token:`);

    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      unitId: user.unitId || undefined, // This is what the login endpoint does
    };

    console.log(`   Token Payload:`, JSON.stringify(tokenPayload, null, 2));

    const token = generateToken(tokenPayload);
    console.log(`   JWT Token Generated: ${token.substring(0, 50)}...`);

    // Step 4: Decode token to verify what's inside
    const decoded = verifyToken(token);
    console.log(`\n   🔍 Decoded Token Payload:`);
    console.log(`   `, JSON.stringify(decoded, null, 2));

    // Step 5: Check if unitId is in the token
    if (decoded && decoded.unitId) {
      console.log(`   ✅ Unit ID is present in token: ${decoded.unitId}`);
    } else {
      console.log(`   ❌ Unit ID is MISSING from token - CRITICAL ISSUE!`);
      console.log(`   → This owner will get "Page Not Found" when accessing owner pages`);
    }

    // Step 6: Analyze the issue
    console.log(`\n   📊 Analysis:`);
    if (!user.unitId) {
      console.log(`   ❌ DATABASE ISSUE: user.unitId is NULL in database`);
      console.log(`   → FIX: Run migration to link user to their unit`);
    } else if (decoded && !decoded.unitId) {
      console.log(`   ❌ TOKEN GENERATION ISSUE: unitId not included in token`);
      console.log(`   → FIX: Check generateToken function`);
    } else {
      console.log(`   ✅ No issues detected - auth flow should work`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("🔍 Summary of Findings:\n");

  // Get all owner users and check unitId
  const allOwners = await db
    .select()
    .from(users)
    .where(eq(users.role, "owner"));

  const ownersWithUnit = allOwners.filter(u => u.unitId !== null);
  const ownersWithoutUnit = allOwners.filter(u => u.unitId === null);

  console.log(`Total owner accounts: ${allOwners.length}`);
  console.log(`✅ With unitId: ${ownersWithUnit.length}`);
  console.log(`❌ Without unitId: ${ownersWithoutUnit.length}`);

  if (ownersWithoutUnit.length > 0) {
    console.log(`\n⚠️  Owners missing unitId:`);
    ownersWithoutUnit.forEach(owner => {
      console.log(`   - ${owner.username} (${owner.email})`);
    });
  }

  console.log("\n" + "=".repeat(60));
}

testAuthFlow()
  .then(() => {
    console.log("\n✅ Test complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });
