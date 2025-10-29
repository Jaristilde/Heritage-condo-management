import "dotenv/config";
import { db } from "../server/db";
import { users, units } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Fix owner201 user to properly link to Unit 201
 *
 * Problem: owner201 has unitId = "201" (string) instead of the actual UUID
 * Solution: Find Unit 201 by unitNumber, get its UUID, update user
 */

async function fixOwner201Link() {
  console.log("🔧 Fixing owner201 → Unit 201 link...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // 1. Find Unit 201
    const unit201Array = await db
      .select()
      .from(units)
      .where(eq(units.unitNumber, "201"))
      .limit(1);

    if (unit201Array.length === 0) {
      console.error("❌ Unit 201 not found in database!");
      console.log("\n📋 To fix this, run:");
      console.log("   npx tsx scripts/seed-units-and-owners.ts");
      process.exit(1);
    }

    const unit201 = unit201Array[0];
    console.log(`✅ Found Unit 201:`);
    console.log(`   UUID:        ${unit201.id}`);
    console.log(`   Unit Number: ${unit201.unitNumber}`);
    console.log(`   Owner:       ${unit201.ownerName}`);
    console.log(`   Balance:     $${unit201.totalOwed}`);
    console.log("");

    // 2. Find owner201 user
    const owner201Array = await db
      .select()
      .from(users)
      .where(eq(users.username, "owner201"))
      .limit(1);

    if (owner201Array.length === 0) {
      console.error("❌ owner201 user not found in database!");
      console.log("\n📋 To fix this, run:");
      console.log("   npx tsx scripts/seed-users-demo-passwords.ts");
      process.exit(1);
    }

    const owner201User = owner201Array[0];
    console.log(`✅ Found owner201 user:`);
    console.log(`   User ID:     ${owner201User.id}`);
    console.log(`   Username:    ${owner201User.username}`);
    console.log(`   Role:        ${owner201User.role}`);
    console.log(`   Current unitId: ${owner201User.unitId || '(not set)'}`);
    console.log("");

    // 3. Update owner201 to link to Unit 201
    const result = await db
      .update(users)
      .set({ unitId: unit201.id })
      .where(eq(users.username, "owner201"))
      .returning();

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ SUCCESS! owner201 is now linked to Unit 201");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
    console.log(`Updated user:`);
    console.log(`   Username: ${result[0].username}`);
    console.log(`   Unit ID:  ${result[0].unitId}`);
    console.log("");
    console.log("🎉 You can now login as:");
    console.log("   Username: owner201");
    console.log("   Password: owner123");
    console.log("");
    console.log("And you'll see:");
    console.log("   ✅ Unit 201 information");
    console.log("   ✅ Balance and payment options");
    console.log("   ✅ Make payment page");
    console.log("   ✅ Profile with all owner details");
    console.log("");

  } catch (error) {
    console.error("❌ Error fixing owner201 link:", error);
    throw error;
  }
}

fixOwner201Link()
  .then(() => {
    console.log("🚀 Fix applied successfully!");
    console.log("🌐 Test at: http://localhost:5001/login");
    console.log("");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fix failed:", error);
    process.exit(1);
  });
