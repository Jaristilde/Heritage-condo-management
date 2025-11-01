import "dotenv/config";
import { db } from "../server/db";
import { users, units } from "@shared/schema";
import { eq, isNull, sql } from "drizzle-orm";

/**
 * DATABASE ADMINISTRATOR INVESTIGATION
 * ====================================
 * Investigates owner login issues:
 * - owner201 works ✅
 * - owner202, owner203, owner204, owner405 show "Page Not Found" ❌
 *
 * UPDATE: All database records are valid! The issue is CLIENT-SIDE ROUTING.
 */

interface OwnerInvestigation {
  username: string;
  userId: string | null;
  email: string | null;
  role: string | null;
  active: boolean | null;
  unitId: string | null;
  unitNumber: string | null;
  unitExists: boolean;
  issue: string[];
  status: "WORKING" | "BROKEN";
}

async function investigateOwnerDatabase() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║     DATABASE ADMINISTRATOR - OWNER LOGIN INVESTIGATION      ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const targetOwners = [
    "owner201", // WORKING ✅
    "owner202", // BROKEN ❌
    "owner203", // BROKEN ❌
    "owner204", // BROKEN ❌
    "owner405", // BROKEN ❌
  ];

  const results: OwnerInvestigation[] = [];

  // Step 1: Check each owner account
  console.log("📊 STEP 1: Checking Owner Accounts");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  for (const username of targetOwners) {
    const investigation: OwnerInvestigation = {
      username,
      userId: null,
      email: null,
      role: null,
      active: null,
      unitId: null,
      unitNumber: null,
      unitExists: false,
      issue: [],
      status: "BROKEN",
    };

    // Check if user exists
    const userRecords = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (userRecords.length === 0) {
      investigation.issue.push("❌ User account does NOT exist in database");
      results.push(investigation);
      continue;
    }

    const user = userRecords[0];
    investigation.userId = user.id;
    investigation.email = user.email;
    investigation.role = user.role;
    investigation.active = user.active;
    investigation.unitId = user.unitId;

    // Check for issues
    if (!user.active) {
      investigation.issue.push("⚠️  Account is INACTIVE");
    }

    if (!user.unitId) {
      investigation.issue.push("❌ NULL unitId - no unit association");
    } else {
      // Check if the unit exists
      const unitRecords = await db
        .select()
        .from(units)
        .where(eq(units.id, user.unitId))
        .limit(1);

      if (unitRecords.length === 0) {
        investigation.issue.push(
          `❌ unitId "${user.unitId}" does NOT exist in units table`
        );
      } else {
        investigation.unitExists = true;
        investigation.unitNumber = unitRecords[0].unitNumber;

        // Check username pattern match
        const expectedUnitNumber = username.replace("owner", "");
        if (unitRecords[0].unitNumber !== expectedUnitNumber) {
          investigation.issue.push(
            `⚠️  Username pattern mismatch: username=${username} but unit=${unitRecords[0].unitNumber}`
          );
        }
      }
    }

    if (investigation.issue.length === 0) {
      investigation.status = "WORKING";
      investigation.issue.push("✅ All checks PASSED");
    }

    results.push(investigation);
  }

  // Step 2: Display detailed findings
  console.log("\n📋 DETAILED FINDINGS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  for (const result of results) {
    const statusIcon = result.status === "WORKING" ? "✅" : "❌";
    console.log(
      `${statusIcon} ${result.username.toUpperCase()} - ${result.status}`
    );
    console.log(`   User ID: ${result.userId || "NOT FOUND"}`);
    console.log(`   Email: ${result.email || "N/A"}`);
    console.log(`   Role: ${result.role || "N/A"}`);
    console.log(`   Active: ${result.active ?? "N/A"}`);
    console.log(`   Unit ID: ${result.unitId || "NULL"}`);
    console.log(`   Unit Number: ${result.unitNumber || "N/A"}`);
    console.log(`   Unit Exists: ${result.unitExists}`);
    console.log(`\n   Issues:`);
    for (const issue of result.issue) {
      console.log(`   ${issue}`);
    }
    console.log("\n");
  }

  // Step 3: Database-wide statistics
  console.log("\n📊 DATABASE-WIDE OWNER STATISTICS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Count owners with NULL unitId
  const nullUnitIdOwners = await db
    .select({
      username: users.username,
      email: users.email,
      role: users.role,
      active: users.active,
    })
    .from(users)
    .where(sql`${users.role} = 'owner' AND ${users.unitId} IS NULL`);

  console.log(`❌ Owners with NULL unitId: ${nullUnitIdOwners.length}`);
  if (nullUnitIdOwners.length > 0) {
    console.log("   Affected accounts:");
    for (const owner of nullUnitIdOwners) {
      console.log(
        `   - ${owner.username} (${owner.email}) - Active: ${owner.active}`
      );
    }
  }
  console.log("");

  // Count all owners
  const allOwners = await db
    .select({
      username: users.username,
      unitId: users.unitId,
      active: users.active,
    })
    .from(users)
    .where(eq(users.role, "owner"));

  console.log(`📈 Total owner accounts: ${allOwners.length}`);
  console.log(
    `   Active: ${allOwners.filter((o) => o.active).length}`
  );
  console.log(
    `   Inactive: ${allOwners.filter((o) => !o.active).length}`
  );
  console.log(
    `   With unitId: ${allOwners.filter((o) => o.unitId).length}`
  );
  console.log(
    `   Without unitId: ${allOwners.filter((o) => !o.unitId).length}`
  );
  console.log("");

  // Step 4: Check for mismatched unitId (owner points to non-existent unit)
  console.log("🔍 Checking for orphaned unit associations...");
  const ownersWithUnits = await db
    .select({
      username: users.username,
      unitId: users.unitId,
    })
    .from(users)
    .where(sql`${users.role} = 'owner' AND ${users.unitId} IS NOT NULL`);

  const orphanedOwners: string[] = [];
  for (const owner of ownersWithUnits) {
    const unitExists = await db
      .select()
      .from(units)
      .where(eq(units.id, owner.unitId!))
      .limit(1);

    if (unitExists.length === 0) {
      orphanedOwners.push(
        `${owner.username} -> unitId="${owner.unitId}" (DOES NOT EXIST)`
      );
    }
  }

  console.log(
    `❌ Owners with orphaned unitId: ${orphanedOwners.length}`
  );
  if (orphanedOwners.length > 0) {
    console.log("   Affected accounts:");
    for (const orphan of orphanedOwners) {
      console.log(`   - ${orphan}`);
    }
  }
  console.log("");

  // Step 5: Summary and root cause
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║                    INVESTIGATION SUMMARY                    ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const workingCount = results.filter((r) => r.status === "WORKING").length;
  const brokenCount = results.filter((r) => r.status === "BROKEN").length;

  console.log(`✅ Database checks passed: ${workingCount}`);
  console.log(`❌ Database issues found: ${brokenCount}\n`);

  console.log("🔍 ROOT CAUSE ANALYSIS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const nullUnitIdCount = results.filter(
    (r) => r.unitId === null
  ).length;
  const orphanedUnitCount = results.filter(
    (r) => r.unitId !== null && !r.unitExists
  ).length;

  if (nullUnitIdCount > 0) {
    console.log(
      `❌ DATABASE ISSUE: ${nullUnitIdCount} owner(s) have NULL unitId`
    );
  }

  if (orphanedUnitCount > 0) {
    console.log(
      `❌ DATABASE ISSUE: ${orphanedUnitCount} owner(s) have invalid unitId`
    );
  }

  if (nullUnitIdCount === 0 && orphanedUnitCount === 0) {
    console.log("✅ ALL DATABASE RECORDS ARE VALID!");
    console.log("\n💡 FINDING: The database is NOT the problem!");
    console.log("\n🔍 CLIENT-SIDE ROUTING ANALYSIS:");
    console.log("   Based on App.tsx, owner role users have LIMITED routes:");
    console.log("   ✅ Available: /, /payment, /history, /profile");
    console.log("   ❌ NOT Available: /owners/:unitNumber (board/mgmt only)");
    console.log("\n   HYPOTHESIS:");
    console.log("   If users are trying to access /owners/202, /owners/203, etc.");
    console.log("   they will get 'Page Not Found' because those routes don't");
    console.log("   exist for the 'owner' role.");
    console.log("\n   SOLUTION:");
    console.log("   1. Owner users should access their dashboard at '/' (root)");
    console.log("   2. OR we need to add /owners/:unitNumber route for owners");
    console.log("   3. Check what URL they're actually trying to access");
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("✅ Investigation complete!\n");
}

investigateOwnerDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
