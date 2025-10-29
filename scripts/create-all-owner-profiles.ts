import "dotenv/config";
import { db } from "../server/db";
import { users, units, owners } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

/**
 * Create user accounts and profiles for all 24 Heritage Condo owners
 *
 * Creates:
 * - User accounts: owner201-owner408 (password: owner123)
 * - Owner records with contact information
 * - Links users to their respective units
 */

const ownersData = [
  // BUILDING 2
  { unitNumber: "201", fullName: "JOSE PEIRATS TRS", email: "peppeirats@gmail.com", phone: "786-319-8010" },
  { unitNumber: "202", fullName: "JOANE ARISTILDE", email: "joanearistilde@gmail.com", phone: "305-332-5401" },
  { unitNumber: "203", fullName: "GABRIELLE FABRE", email: "gabriellefabre1938@gmail.com", phone: "786-487-8304" },
  { unitNumber: "204", fullName: "LORRAINE EPELBAUM", email: "l0rrainee@aol.com", phone: "305-609-0169" },
  { unitNumber: "205", fullName: "DAN WARD", email: "wardinmiami@gmail.com", phone: "305-608-3676" },
  { unitNumber: "206", fullName: "RAMON A ORTEGA", email: "ocruz@homeluxrealty.com", phone: "786-287-5501" },
  { unitNumber: "207", fullName: "JIFOOD GROUP LLC", email: "jifoodgroup@gmail.com", phone: "610-209-9204" },
  { unitNumber: "208", fullName: "DAN WARD", email: "wardinmiami@gmail.com", phone: "305-608-3676" },

  // BUILDING 3
  { unitNumber: "301", fullName: "HORACIO GAISER TRS", email: "horaciogaiser@gmail.com", phone: "727-555-0301" },
  { unitNumber: "302", fullName: "MICHAEL V LIEVANO", email: "cal.v831@gmail.com", phone: "305-546-1252" },
  { unitNumber: "303", fullName: "CORONADO II 1024 INC", email: "rfreitess@hotmail.com", phone: "786-295-1204" },
  { unitNumber: "304", fullName: "RED CARPET GROUP INVESTMENTS LLC", email: "danielcalabrese@redcarpet.com", phone: "305-555-0304" },
  { unitNumber: "305", fullName: "OLIVIA LOPERA", email: "lopera.olivia@yahoo.com", phone: "305-555-0305" },
  { unitNumber: "306", fullName: "RAMON ORTEGA", email: "ocruz@homeluxrealty.com", phone: "786-287-5501" },
  { unitNumber: "307", fullName: "GIERRE USA CORP", email: "g.ribaudo@gierreusa.com", phone: "734-620-4932" },
  { unitNumber: "308", fullName: "MICHAEL HAM EST OF", email: "estate308@heritage-hoa.com", phone: "305-555-0308" },

  // BUILDING 4
  { unitNumber: "401", fullName: "JOSE F RODRIGUEZ", email: "jfrcuba@yahoo.com", phone: "305-308-4089" },
  { unitNumber: "402", fullName: "EST OF ADELA D SOMODEVILLA", email: "estate402@heritage-hoa.com", phone: "305-551-0243" },
  { unitNumber: "403", fullName: "FEDERICO HURTADO", email: "federico.hurtado@gmail.com", phone: "786-267-3536" },
  { unitNumber: "404", fullName: "GRALPE LLC", email: "fladelvalle23@gmail.com", phone: "530-918-8390" },
  { unitNumber: "405", fullName: "CORDELL C DAVIS", email: "Cdavis6085@yahoo.com", phone: "786-792-4073" },
  { unitNumber: "406", fullName: "JOSE PEIRATS TRS", email: "peppeirats@gmail.com", phone: "786-319-8010" },
  { unitNumber: "407", fullName: "BRIAN MORRISON", email: "brianwmorrisson@gmail.com", phone: "917-816-4228" },
  { unitNumber: "408", fullName: "SARA B LEVITEN TRS", email: "levitens@bellsouth.net", phone: "305-401-9325" },
];

async function createAllOwnerProfiles() {
  console.log("👥 Creating profiles for all 24 Heritage Condo owners...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  const hashedPassword = await bcrypt.hash("owner123", 10);
  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const ownerData of ownersData) {
    try {
      // Find the unit
      const unitArray = await db
        .select()
        .from(units)
        .where(eq(units.unitNumber, ownerData.unitNumber))
        .limit(1);

      if (unitArray.length === 0) {
        console.log(`   ❌ Unit ${ownerData.unitNumber} not found - skipping`);
        errors++;
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
        // Create user
        await db.insert(users).values({
          username,
          password: hashedPassword,
          email: ownerData.email,
          role: "owner",
          unitId: unit.id,
        });
        created++;
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
      }

      // Check if owner record exists
      const existingOwner = await db
        .select()
        .from(owners)
        .where(eq(owners.unitId, unit.id))
        .limit(1);

      if (existingOwner.length === 0) {
        // Create owner record
        await db.insert(owners).values({
          unitId: unit.id,
          fullName: ownerData.fullName,
          email: ownerData.email,
          phone: ownerData.phone,
          mailingAddress: `645 NE 121st Street, Unit ${ownerData.unitNumber}, North Miami Beach, FL 33162`,
          isPrimary: true,
          status: "active",
        });
      } else {
        // Update owner record
        await db
          .update(owners)
          .set({
            fullName: ownerData.fullName,
            email: ownerData.email,
            phone: ownerData.phone,
            mailingAddress: `645 NE 121st Street, Unit ${ownerData.unitNumber}, North Miami Beach, FL 33162`,
            status: "active",
          })
          .where(eq(owners.unitId, unit.id));
      }

      console.log(`   ✅ Unit ${ownerData.unitNumber}: ${ownerData.fullName} (${username})`);

    } catch (error) {
      console.error(`   ❌ Error creating profile for Unit ${ownerData.unitNumber}:`, error);
      errors++;
    }
  }

  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Profile Creation Complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log(`📊 Summary:`);
  console.log(`   New profiles created: ${created}`);
  console.log(`   Existing profiles updated: ${updated}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total processed: ${created + updated}`);
  console.log("");
  console.log("🔐 Login Credentials:");
  console.log("   Usernames: owner201, owner202, owner203... owner408");
  console.log("   Password (all accounts): owner123");
  console.log("");
  console.log("📋 Example logins:");
  console.log("   Unit 201 (JOSE PEIRATS): owner201 / owner123");
  console.log("   Unit 202 (JOANE ARISTILDE): owner202 / owner123");
  console.log("   Unit 203 (GABRIELLE FABRE): owner203 / owner123");
  console.log("   Unit 205 (DAN WARD): owner205 / owner123");
  console.log("");
  console.log("🌐 Login at: http://localhost:5001/login");
  console.log("");
}

createAllOwnerProfiles()
  .then(() => {
    console.log("🚀 All owner profiles ready!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed:", error);
    process.exit(1);
  });
