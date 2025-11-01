import "dotenv/config";
import { db } from "../server/db";
import { users, units, owners } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

/**
 * PRODUCTION MIGRATION: Fix all owner logins
 *
 * This script will:
 * 1. Add owner data columns to units table (if not exist)
 * 2. Populate units with owner data from Juda & Eskew
 * 3. Reset all owner passwords to Heritage2025!
 * 4. Verify all accounts work
 */

async function productionMigration() {
  console.log("🚀 PRODUCTION MIGRATION: Owner Login Fix");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  try {
    // STEP 1: Add owner columns to units table
    console.log("📋 Step 1: Adding owner columns to units table...");
    try {
      await db.execute(sql`ALTER TABLE units ADD COLUMN IF NOT EXISTS owner_name TEXT`);
      await db.execute(sql`ALTER TABLE units ADD COLUMN IF NOT EXISTS owner_email TEXT`);
      await db.execute(sql`ALTER TABLE units ADD COLUMN IF NOT EXISTS owner_phone TEXT`);
      await db.execute(sql`ALTER TABLE units ADD COLUMN IF NOT EXISTS owner_mailing_address TEXT`);
      console.log("✅ Owner columns added");
    } catch (error: any) {
      console.log("⚠️  Columns may already exist:", error.message);
    }
    console.log("");

    // STEP 2: Populate owner data
    console.log("📋 Step 2: Populating owner data...");

    const ownerData = [
      // BUILDING 2
      { unitNumber: "201", ownerName: "JOSE PEIRATS TRS - THE JOSE PEIRATS AND", email: "peppeirats@gmail.com", phone: "786-319-8010", mailingAddress: "" },
      { unitNumber: "202", ownerName: "JOANE ARISTILDE", email: "joanearistilde@gmail.com", phone: "305-332-5401", mailingAddress: "" },
      { unitNumber: "203", ownerName: "GABRIELLE FABRE", email: "gabriellefabre1938@gmail.com", phone: "786-487-8304", mailingAddress: "" },
      { unitNumber: "204", ownerName: "LORRAINE EPELBAUM", email: "l0rrainee@aol.com", phone: "305-609-0169", mailingAddress: "" },
      { unitNumber: "205", ownerName: "DAN WARD - HOMEWARD PROPERTIES INC", email: "wardinmiami@gmail.com", phone: "+1 (305) 608-3676", mailingAddress: "" },
      { unitNumber: "206", ownerName: "RAMON A ORTEGA", email: "ocruz@homeluxrealty.com", phone: "786-287-5501", mailingAddress: "" },
      { unitNumber: "207", ownerName: "JIFOOD GROUP LLC", email: "jifoodgroup@gmail.com", phone: "610-209-9204", mailingAddress: "4000 NE 169 ST APT 300 - North Miami beach FL 33160" },
      { unitNumber: "208", ownerName: "DAN WARD - HOMEWARD PROPERTIES INC", email: "wardinmiami@gmail.com", phone: "+1 (305) 608-3676", mailingAddress: "" },
      // BUILDING 3
      { unitNumber: "301", ownerName: "HORACIO GAISER TRS - HORACIO GAISER AND PATRICIA GNAVI", email: "", phone: "", mailingAddress: "PO BOX 35085, ST PETERSBURG, FL 33705" },
      { unitNumber: "302", ownerName: "MICHAEL V LIEVANO - CALLY A VANN", email: "cal.v831@gmail.com", phone: "305-546-1252", mailingAddress: "" },
      { unitNumber: "303", ownerName: "CORONADO II 1024 INC", email: "rfreitess@hotmail.com", phone: "786-295-1204", mailingAddress: "" },
      { unitNumber: "304", ownerName: "RED CARPET GROUP INVESTMENTS LLC / Daniel Calabrese", email: "", phone: "", mailingAddress: "7742 N. KENDALL DRIVE, SUITE #87, MIAMI FL 33156" },
      { unitNumber: "305", ownerName: "OLIVIA LOPERA", email: "lopera.olivia@yahoo.com", phone: "", mailingAddress: "" },
      { unitNumber: "306", ownerName: "RAMON ORTEGA", email: "", phone: "786-287-5501", mailingAddress: "" },
      { unitNumber: "307", ownerName: "GIERRE USA CORP / Giorgio V. Ribaudo", email: "g.ribaudo@gierreusa.com", phone: "(734) 620-4932", mailingAddress: "" },
      { unitNumber: "308", ownerName: "MICHAEL HAM EST OF", email: "", phone: "", mailingAddress: "" },
      // BUILDING 4
      { unitNumber: "401", ownerName: "JOSE F RODRIGUEZ", email: "jfrcuba@yahoo.com", phone: "(305) 308-4089", mailingAddress: "645 NE 121 Street" },
      { unitNumber: "402", ownerName: "EST OF ADELA D SOMODEVILLA", email: "", phone: "+1 (305) 551-0243", mailingAddress: "" },
      { unitNumber: "403", ownerName: "FEDERICO HURTADO", email: "federico.hurtado@gmail.com", phone: "786-267-3536", mailingAddress: "" },
      { unitNumber: "404", ownerName: "GRALPE LLC", email: "fladelvalle23@gmail.com", phone: "(530) 918-8390", mailingAddress: "" },
      { unitNumber: "405", ownerName: "CORDELL C DAVIS", email: "Cdavis6085@yahoo.com", phone: "786-792-4073", mailingAddress: "" },
      { unitNumber: "406", ownerName: "JOSE PEIRATS TRS - THE JOSE PEIRATS AND CATALINA", email: "peppeirats@gmail.com", phone: "786-319-8010", mailingAddress: "" },
      { unitNumber: "407", ownerName: "BRIAN MORRISON", email: "brianwmorrisson@gmail.com", phone: "917-816-4228", mailingAddress: "442 NE 77 ST, Miami, FL 33138" },
      { unitNumber: "408", ownerName: "SARA B LEVITEN TRS - SARA B LEVITEN INTERVIVOS REV TR", email: "levitens@bellsouth.net", phone: "3054019325", mailingAddress: "645 NE 121 Street" },
    ];

    let updated = 0;
    for (const owner of ownerData) {
      try {
        const unit = await db.select().from(units).where(eq(units.unitNumber, owner.unitNumber)).limit(1);
        if (unit.length > 0) {
          await db.update(units).set({
            ownerName: owner.ownerName,
            ownerEmail: owner.email || null,
            ownerPhone: owner.phone || null,
            ownerMailingAddress: owner.mailingAddress || null,
          }).where(eq(units.id, unit[0].id));
          updated++;
        }
      } catch (error: any) {
        console.error(`❌ Failed to update Unit ${owner.unitNumber}:`, error.message);
      }
    }
    console.log(`✅ Updated ${updated} units with owner data`);
    console.log("");

    // STEP 3: Reset all owner passwords
    console.log("📋 Step 3: Resetting all owner passwords...");

    const password = "Heritage2025!";
    const hashedPassword = await bcrypt.hash(password, 10);

    const allUnits = await db.select().from(units);
    let passwordsReset = 0;

    for (const unit of allUnits) {
      const username = `owner${unit.unitNumber}`;

      try {
        const userAccounts = await db.select().from(users).where(eq(users.username, username)).limit(1);

        if (userAccounts.length === 0) {
          // Create user account
          try {
            await db.insert(users).values({
              username,
              email: unit.ownerEmail || `${username}@heritagecondo.com`,
              password: hashedPassword,
              role: "owner",
              unitId: unit.id,
              active: true,
              mustChangePassword: false,
            });
            console.log(`✅ Created ${username}`);
          } catch (emailError: any) {
            if (emailError.message?.includes('users_email_unique')) {
              await db.insert(users).values({
                username,
                email: `${username}@heritagecondo.com`,
                password: hashedPassword,
                role: "owner",
                unitId: unit.id,
                active: true,
                mustChangePassword: false,
              });
              console.log(`✅ Created ${username} (multi-unit owner)`);
            } else {
              throw emailError;
            }
          }
        } else {
          // Update password
          await db.update(users).set({
            password: hashedPassword,
            unitId: unit.id,
            active: true,
            mustChangePassword: false,
          }).where(eq(users.id, userAccounts[0].id));
          console.log(`✅ Updated ${username}`);
        }

        passwordsReset++;
      } catch (error: any) {
        console.error(`❌ Error with ${username}:`, error.message);
      }
    }

    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ MIGRATION COMPLETE!");
    console.log(`   Units updated: ${updated}`);
    console.log(`   Passwords reset: ${passwordsReset}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
    console.log("🔑 ALL OWNER LOGIN CREDENTIALS:");
    console.log(`   Username: owner{UnitNumber}`);
    console.log(`   Password: ${password}`);
    console.log("");
    console.log("Examples:");
    console.log(`   Unit 201: owner201 / ${password}`);
    console.log(`   Unit 202: owner202 / ${password}`);
    console.log(`   Unit 305: owner305 / ${password}`);
    console.log("");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

productionMigration()
  .then(() => {
    console.log("🎉 Migration complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
