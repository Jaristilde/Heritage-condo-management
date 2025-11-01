import "dotenv/config";
import { db } from "../server/db";
import { users, units, owners } from "@shared/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

/**
 * Comprehensive script to verify and fix ALL owner logins:
 * 1. Verify all 24 owner user accounts exist
 * 2. Reset all passwords to Heritage2025!
 * 3. Verify units have owner data (name, email, phone)
 * 4. Create owner records in owners table
 * 5. Link everything properly
 */

async function verifyAndFixOwnerLogins() {
  console.log("🔍 Verifying and fixing ALL owner logins...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  const password = "Heritage2025!";
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Get all units
    const allUnits = await db.select().from(units);
    console.log(`✅ Found ${allUnits.length} units in database`);
    console.log("");

    let fixed = 0;
    let errors = 0;

    for (const unit of allUnits) {
      const username = `owner${unit.unitNumber}`;

      try {
        console.log(`📋 Unit ${unit.unitNumber}: ${unit.ownerName || 'NO OWNER NAME'}`);

        // Check if user account exists
        const userAccounts = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        let userId: string;

        if (userAccounts.length === 0) {
          // Create user account
          try {
            const [newUser] = await db.insert(users).values({
              username,
              email: unit.ownerEmail || `${username}@heritagecondo.com`,
              password: hashedPassword,
              role: "owner",
              unitId: unit.id,
              active: true,
              mustChangePassword: false,
            }).returning();

            userId = newUser.id;
            console.log(`   ✅ Created user account: ${username}`);
          } catch (emailError: any) {
            // If email already exists (multi-unit owner), create with unit-specific email
            if (emailError.message?.includes('users_email_unique')) {
              const [newUser] = await db.insert(users).values({
                username,
                email: `${username}@heritagecondo.com`, // Use unit-specific email
                password: hashedPassword,
                role: "owner",
                unitId: unit.id,
                active: true,
                mustChangePassword: false,
              }).returning();

              userId = newUser.id;
              console.log(`   ✅ Created user account: ${username} (multi-unit owner - unit-specific email)`);
            } else {
              throw emailError;
            }
          }
        } else {
          // Update existing user with correct password and link to unit
          await db.update(users).set({
            password: hashedPassword,
            unitId: unit.id,
            email: unit.ownerEmail || userAccounts[0].email,
            active: true,
            mustChangePassword: false,
          }).where(eq(users.id, userAccounts[0].id));

          userId = userAccounts[0].id;
          console.log(`   ✅ Updated user account: ${username}`);
        }

        // Check if owner record exists
        const ownerRecords = await db
          .select()
          .from(owners)
          .where(eq(owners.unitId, unit.id))
          .limit(1);

        if (ownerRecords.length === 0 && unit.ownerName) {
          // Create owner record
          await db.insert(owners).values({
            unitId: unit.id,
            fullName: unit.ownerName,
            email: unit.ownerEmail,
            phone: unit.ownerPhone,
            mailingAddress: unit.ownerMailingAddress,
            isPrimary: true,
            status: "active",
          });
          console.log(`   ✅ Created owner record`);
        }

        // Display owner info
        console.log(`   📧 Email: ${unit.ownerEmail || 'MISSING'}`);
        console.log(`   📱 Phone: ${unit.ownerPhone || 'MISSING'}`);
        console.log(`   💰 Balance: $${unit.totalOwed || '0.00'}`);
        console.log(`   🔑 Login: ${username} / ${password}`);
        console.log("");

        fixed++;

      } catch (error: any) {
        console.error(`   ❌ Error fixing Unit ${unit.unitNumber}:`, error.message);
        console.log("");
        errors++;
      }
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ Fixed: ${fixed} units`);
    console.log(`❌ Errors: ${errors}`);
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
    console.error("❌ Fatal error:", error);
    throw error;
  }
}

verifyAndFixOwnerLogins()
  .then(() => {
    console.log("🎉 Verification and fix complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
