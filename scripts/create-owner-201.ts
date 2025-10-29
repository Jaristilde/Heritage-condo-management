import "dotenv/config";
import { db } from "../server/db";
import { owners, units } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Create owner record for Unit 201
 *
 * Owner info from seed file:
 * - JOSE PEIRATS TRS
 * - Email: peppeirats@gmail.com
 * - Phone: 786-319-8010
 */

async function createOwner201() {
  console.log("👤 Creating owner record for Unit 201...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // Find Unit 201
    const unit201Array = await db
      .select()
      .from(units)
      .where(eq(units.unitNumber, "201"))
      .limit(1);

    if (unit201Array.length === 0) {
      console.error("❌ Unit 201 not found!");
      process.exit(1);
    }

    const unit201 = unit201Array[0];
    console.log(`✅ Found Unit 201 (ID: ${unit201.id})`);
    console.log("");

    // Check if owner already exists
    const existingOwner = await db
      .select()
      .from(owners)
      .where(eq(owners.unitId, unit201.id))
      .limit(1);

    if (existingOwner.length > 0) {
      console.log("⚠️  Owner already exists for Unit 201");
      console.log(`   Name: ${existingOwner[0].fullName}`);
      console.log(`   Email: ${existingOwner[0].email}`);
      console.log("");
      console.log("Updating existing owner...");

      // Update existing owner
      const updated = await db
        .update(owners)
        .set({
          fullName: "JOSE PEIRATS",
          email: "peppeirats@gmail.com",
          phone: "786-319-8010",
          mailingAddress: "645 NE 121st Street, Unit 201, North Miami Beach, FL 33162",
          isPrimary: true,
          status: "active",
        })
        .where(eq(owners.unitId, unit201.id))
        .returning();

      console.log("✅ Owner updated!");
      console.log(`   Name: ${updated[0].fullName}`);
      console.log(`   Email: ${updated[0].email}`);
      console.log(`   Phone: ${updated[0].phone}`);
    } else {
      // Create new owner
      const newOwner = await db
        .insert(owners)
        .values({
          unitId: unit201.id,
          fullName: "JOSE PEIRATS",
          email: "peppeirats@gmail.com",
          phone: "786-319-8010",
          mailingAddress: "645 NE 121st Street, Unit 201, North Miami Beach, FL 33162",
          isPrimary: true,
          status: "active",
        })
        .returning();

      console.log("✅ Owner created!");
      console.log(`   ID: ${newOwner[0].id}`);
      console.log(`   Name: ${newOwner[0].fullName}`);
      console.log(`   Email: ${newOwner[0].email}`);
      console.log(`   Phone: ${newOwner[0].phone}`);
    }

    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ SUCCESS!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
    console.log("Now login as owner201 to see complete information!");
    console.log("");

  } catch (error) {
    console.error("❌ Error creating owner:", error);
    throw error;
  }
}

createOwner201()
  .then(() => {
    console.log("🚀 Owner record ready!");
    console.log("🌐 Login at: http://localhost:5001/login");
    console.log("");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed:", error);
    process.exit(1);
  });
