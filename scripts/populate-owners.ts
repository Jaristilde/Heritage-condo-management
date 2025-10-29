import "dotenv/config";
import { db } from "../server/db";
import { units, owners } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Populate owner information for existing units
 * This script adds owner data to the owners table for each existing unit
 */

const ownersData = [
  { unitNumber: "201", ownerName: "JOSE PEIRATS TRS - THE JOSE PEIRATS AND", email: "peppeirats@gmail.com", phone: "786-319-8010", mailingAddress: "" },
  { unitNumber: "202", ownerName: "JOANE ARISTILDE", email: "joanearistilde@gmail.com", phone: "305-332-5401", mailingAddress: "" },
  { unitNumber: "203", ownerName: "GABRIELLE FABRE", email: "gabriellefabre1938@gmail.com", phone: "786-487-8304", mailingAddress: "" },
  { unitNumber: "204", ownerName: "LORRAINE EPELBAUM", email: "l0rrainee@aol.com", phone: "305-609-0169", mailingAddress: "" },
  { unitNumber: "205", ownerName: "DAN WARD - HOMEWARD PROPERTIES INC", email: "wardinmiami@gmail.com", phone: "+1 (305) 608-3676", mailingAddress: "" },
  { unitNumber: "206", ownerName: "RAMON A ORTEGA", email: "ocruz@homeluxrealty.com", phone: "786-287-5501", mailingAddress: "" },
  { unitNumber: "207", ownerName: "JIFOOD GROUP LLC", email: "jifoodgroup@gmail.com", phone: "610-209-9204", mailingAddress: "4000 NE 169 ST APT 300 - North Miami beach FL 33160" },
  { unitNumber: "208", ownerName: "DAN WARD - HOMEWARD PROPERTIES INC", email: "wardinmiami@gmail.com", phone: "+1 (305) 608-3676", mailingAddress: "" },
  { unitNumber: "301", ownerName: "HORACIO GAISER TRS - HORACIO GAISER AND PATRICIA GNAVI", email: "", phone: "", mailingAddress: "PO BOX 35085, ST PETERSBURG, FL 33705" },
  { unitNumber: "302", ownerName: "MICHAEL V LIEVANO - CALLY A VANN", email: "cal.v831@gmail.com", phone: "305-546-1252", mailingAddress: "" },
  { unitNumber: "303", ownerName: "CORONADO II 1024 INC", email: "rfreitess@hotmail.com", phone: "786-295-1204", mailingAddress: "" },
  { unitNumber: "304", ownerName: "RED CARPET GROUP INVESTMENTS LLC / Daniel Calabrese", email: "", phone: "", mailingAddress: "7742 N. KENDALL DRIVE, SUITE #87, MIAMI FL 33156" },
  { unitNumber: "305", ownerName: "OLIVIA LOPERA", email: "lopera.olivia@yahoo.com", phone: "", mailingAddress: "" },
  { unitNumber: "306", ownerName: "RAMON ORTEGA", email: "", phone: "786-287-5501", mailingAddress: "" },
  { unitNumber: "307", ownerName: "GIERRE USA CORP / Giorgio V. Ribaudo", email: "g.ribaudo@gierreusa.com", phone: "(734) 620-4932", mailingAddress: "" },
  { unitNumber: "308", ownerName: "MICHAEL HAM EST OF", email: "", phone: "", mailingAddress: "" },
  { unitNumber: "401", ownerName: "JOSE F RODRIGUEZ", email: "jfrcuba@yahoo.com", phone: "(305) 308-4089", mailingAddress: "645 NE 121 Street" },
  { unitNumber: "402", ownerName: "EST OF ADELA D SOMODEVILLA", email: "", phone: "+1 (305) 551-0243", mailingAddress: "" },
  { unitNumber: "403", ownerName: "FEDERICO HURTADO", email: "federico.hurtado@gmail.com", phone: "786-267-3536", mailingAddress: "" },
  { unitNumber: "404", ownerName: "GRALPE LLC", email: "fladelvalle23@gmail.com", phone: "(530) 918-8390", mailingAddress: "" },
  { unitNumber: "405", ownerName: "CORDELL C DAVIS", email: "Cdavis6085@yahoo.com", phone: "786-792-4073", mailingAddress: "" },
  { unitNumber: "406", ownerName: "JOSE PEIRATS TRS - THE JOSE PEIRATS AND CATALINA", email: "peppeirats@gmail.com", phone: "786-319-8010", mailingAddress: "" },
  { unitNumber: "407", ownerName: "BRIAN MORRISON", email: "brianwmorrisson@gmail.com", phone: "917-816-4228", mailingAddress: "442 NE 77 ST, Miami, FL 33138" },
  { unitNumber: "408", ownerName: "SARA B LEVITEN TRS - SARA B LEVITEN INTERVIVOS REV TR", email: "levitens@bellsouth.net", phone: "3054019325", mailingAddress: "645 NE 121 Street" },
];

async function populateOwners() {
  console.log("🏢 Populating owner information for existing units...");
  console.log("====================================================");

  try {
    let created = 0;
    let skipped = 0;

    for (const ownerData of ownersData) {
      // Find the unit by unit number
      const [unit] = await db
        .select()
        .from(units)
        .where(eq(units.unitNumber, ownerData.unitNumber))
        .limit(1);

      if (!unit) {
        console.log(`⚠️  Unit ${ownerData.unitNumber} not found - skipping`);
        skipped++;
        continue;
      }

      // Check if owner already exists for this unit
      const existingOwners = await db
        .select()
        .from(owners)
        .where(eq(owners.unitId, unit.id));

      if (existingOwners.length > 0) {
        console.log(`⏭️  Unit ${ownerData.unitNumber} already has owner - skipping`);
        skipped++;
        continue;
      }

      // Insert owner
      await db.insert(owners).values({
        unitId: unit.id,
        fullName: ownerData.ownerName,
        email: ownerData.email || null,
        phone: ownerData.phone || null,
        mailingAddress: ownerData.mailingAddress || null,
        isPrimary: true,
      });

      console.log(`✅ Unit ${ownerData.unitNumber}: ${ownerData.ownerName}`);
      created++;
    }

    console.log("\n📊 Summary:");
    console.log(`✅ Created: ${created} owners`);
    console.log(`⏭️  Skipped: ${skipped} (already exist)`);
    console.log("\n🎉 Owner population complete!");

  } catch (error) {
    console.error("❌ Error populating owners:", error);
    throw error;
  }
}

// Run the script
populateOwners()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed:", error);
    process.exit(1);
  });
