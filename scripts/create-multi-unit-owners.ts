import "dotenv/config";
import { db } from "../server/db";
import { users, units, owners } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

/**
 * Create profiles for owners who own multiple units
 *
 * These owners have duplicate emails, so we need to use unique emails per unit
 */

const multiUnitOwners = [
  // Dan Ward owns Units 205 & 208
  {
    unitNumber: "205",
    fullName: "DAN WARD",
    email: "wardinmiami+unit205@gmail.com",  // Unique email for user account
    actualEmail: "wardinmiami@gmail.com",     // Actual email in owner record
    phone: "305-608-3676"
  },
  {
    unitNumber: "208",
    fullName: "DAN WARD",
    email: "wardinmiami+unit208@gmail.com",  // Unique email for user account
    actualEmail: "wardinmiami@gmail.com",     // Actual email in owner record
    phone: "305-608-3676"
  },

  // Ramon Ortega owns Units 206 & 306
  {
    unitNumber: "206",
    fullName: "RAMON A ORTEGA",
    email: "ocruz+unit206@homeluxrealty.com",
    actualEmail: "ocruz@homeluxrealty.com",
    phone: "786-287-5501"
  },
  {
    unitNumber: "306",
    fullName: "RAMON ORTEGA",
    email: "ocruz+unit306@homeluxrealty.com",
    actualEmail: "ocruz@homeluxrealty.com",
    phone: "786-287-5501"
  },

  // Jose Peirats owns Units 201 & 406
  {
    unitNumber: "406",
    fullName: "JOSE PEIRATS TRS",
    email: "peppeirats+unit406@gmail.com",
    actualEmail: "peppeirats@gmail.com",
    phone: "786-319-8010"
  },
];

async function createMultiUnitOwners() {
  console.log("👥 Creating profiles for multi-unit owners...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  const hashedPassword = await bcrypt.hash("owner123", 10);
  let created = 0;
  let updated = 0;

  for (const ownerData of multiUnitOwners) {
    try {
      // Find the unit
      const unitArray = await db
        .select()
        .from(units)
        .where(eq(units.unitNumber, ownerData.unitNumber))
        .limit(1);

      if (unitArray.length === 0) {
        console.log(`   ❌ Unit ${ownerData.unitNumber} not found - skipping`);
        continue;
      }

      const unit = unitArray[0];
      const username = `owner${ownerData.unitNumber}`;

      // Check if user exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser.length === 0) {
        // Create user with unique email
        await db.insert(users).values({
          username,
          password: hashedPassword,
          email: ownerData.email, // Unique email for login
          role: "owner",
          unitId: unit.id,
        });
        created++;
        console.log(`   ✅ Created: ${username} (${ownerData.fullName})`);
      } else {
        // Update existing user
        await db
          .update(users)
          .set({
            email: ownerData.email,
            unitId: unit.id,
          })
          .where(eq(users.username, username));
        updated++;
        console.log(`   ✅ Updated: ${username} (${ownerData.fullName})`);
      }

      // Update owner record with actual email
      const existingOwner = await db
        .select()
        .from(owners)
        .where(eq(owners.unitId, unit.id))
        .limit(1);

      if (existingOwner.length > 0) {
        await db
          .update(owners)
          .set({
            fullName: ownerData.fullName,
            email: ownerData.actualEmail, // Use actual email in owner record
            phone: ownerData.phone,
            mailingAddress: `645 NE 121st Street, Unit ${ownerData.unitNumber}, North Miami Beach, FL 33162`,
            status: "active",
          })
          .where(eq(owners.unitId, unit.id));
      }

    } catch (error) {
      console.error(`   ❌ Error for Unit ${ownerData.unitNumber}:`, error);
    }
  }

  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Multi-Unit Owner Profiles Complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log(`📊 Summary:`);
  console.log(`   New profiles created: ${created}`);
  console.log(`   Existing profiles updated: ${updated}`);
  console.log("");
  console.log("🏢 Multi-Unit Owners:");
  console.log("   Dan Ward: Units 205 & 208");
  console.log("     - Login 205: owner205 / owner123");
  console.log("     - Login 208: owner208 / owner123");
  console.log("");
  console.log("   Ramon Ortega: Units 206 & 306");
  console.log("     - Login 206: owner206 / owner123");
  console.log("     - Login 306: owner306 / owner123");
  console.log("");
  console.log("   Jose Peirats: Units 201 & 406");
  console.log("     - Login 201: owner201 / owner123");
  console.log("     - Login 406: owner406 / owner123");
  console.log("");
}

createMultiUnitOwners()
  .then(() => {
    console.log("🚀 All multi-unit owner profiles ready!");
    console.log("🌐 Login at: http://localhost:5001/login");
    console.log("");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed:", error);
    process.exit(1);
  });
