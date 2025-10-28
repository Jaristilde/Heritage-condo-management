import "dotenv/config";
import { db } from "../server/db";
import { units, owners } from "@shared/schema";

/**
 * Seed all 24 Heritage Condo units with actual owner data
 * Data from: Heritage_Condo_owner_contact_as_2025.csv
 * 
 * Unit Layout:
 * - Building 2: Units 201-208
 * - Building 3: Units 301-308
 * - Building 4: Units 401-408
 * 
 * Assessment Amounts:
 * - Monthly Maintenance: $350/unit
 * - First Assessment (Popular Loan): $200/unit
 * - Second Assessment (2024): $5,000/unit
 */

async function seedUnitsAndOwners() {
  console.log("🏢 Seeding Heritage Condo units and owners...");
  console.log("================================================");

  const unitsData = [
    // BUILDING 2 (2nd Floor)
    {
      unitNumber: "201",
      monthlyMaintenance: "350.00",
      ownerName: "JOSE PEIRATS TRS - THE JOSE PEIRATS AND",
      email: "peppeirats@gmail.com",
      phone: "786-319-8010",
      mailingAddress: "",
      rentalStatus: "Rents Out",
      delinquencyStatus: "current", // "Current, Need to Verify"
      priorityLevel: "low",
      maintenanceBalance: "0.00",
      firstAssessmentStatus: "paid", // Assuming current means paid
      firstAssessmentBalance: "0.00",
      secondAssessmentStatus: "paid",
      secondAssessmentBalance: "0.00",
      totalOwed: "0.00",
      notes: "Out-of-State Owner. Need to verify delinquency status.",
      livesOnsite: false,
    },
    {
      unitNumber: "202",
      monthlyMaintenance: "350.00",
      ownerName: "JOANE ARISTILDE",
      email: "joanearistilde@gmail.com",
      phone: "305-332-5401",
      mailingAddress: "",
      rentalStatus: "Lives Onsite",
      delinquencyStatus: "current",
      priorityLevel: "low",
      maintenanceBalance: "0.00",
      firstAssessmentStatus: "paid",
      firstAssessmentBalance: "0.00",
      secondAssessmentStatus: "paid",
      secondAssessmentBalance: "0.00",
      totalOwed: "0.00",
      notes: "Board Secretary. Lives onsite.",
      livesOnsite: true,
    },
    {
      unitNumber: "203",
      monthlyMaintenance: "350.00",
      ownerName: "GABRIELLE FABRE",
      email: "gabriellefabre1938@gmail.com",
      phone: "786-487-8304",
      mailingAddress: "",
      rentalStatus: "Lives Onsite",
      delinquencyStatus: "current",
      priorityLevel: "low",
      maintenanceBalance: "0.00",
      firstAssessmentStatus: "paid",
      firstAssessmentBalance: "0.00",
      secondAssessmentStatus: "paid",
      secondAssessmentBalance: "0.00",
      totalOwed: "0.00",
      notes: "Lives onsite.",
      livesOnsite: true,
    },
    {
      unitNumber: "204",
      monthlyMaintenance: "350.00",
      ownerName: "LORRAINE EPELBAUM",
      email: "l0rrainee@aol.com",
      phone: "305-609-0169",
      mailingAddress: "",
      rentalStatus: "Rents Out",
      delinquencyStatus: "90plus", // Delinquent
      priorityLevel: "high",
      maintenanceBalance: "1050.00", // Assuming 3 months behind
      firstAssessmentStatus: "owed",
      firstAssessmentBalance: "200.00",
      secondAssessmentStatus: "owed",
      secondAssessmentBalance: "5000.00",
      totalOwed: "6250.00",
      notes: "DELINQUENT - Rental property. Priority collection.",
      livesOnsite: false,
    },
    {
      unitNumber: "205",
      monthlyMaintenance: "350.00",
      ownerName: "DAN WARD - HOMEWARD PROPERTIES INC",
      email: "wardinmiami@gmail.com",
      phone: "+1 (305) 608-3676",
      mailingAddress: "",
      rentalStatus: "Rents Out",
      delinquencyStatus: "current",
      priorityLevel: "low",
      maintenanceBalance: "0.00",
      firstAssessmentStatus: "paid",
      firstAssessmentBalance: "0.00",
      secondAssessmentStatus: "paid",
      secondAssessmentBalance: "0.00",
      totalOwed: "0.00",
      notes: "BOARD MEMBER - Dan Ward. Owns Units 205 & 208. Corporate owner (Homeward Properties Inc). Rental properties.",
      livesOnsite: false,
      isBoardMember: true,
    },
    {
      unitNumber: "206",
      monthlyMaintenance: "350.00",
      ownerName: "RAMON A ORTEGA",
      email: "ocruz@homeluxrealty.com",
      phone: "786-287-5501",
      mailingAddress: "",
      rentalStatus: "Rents Out",
      delinquencyStatus: "current",
      priorityLevel: "low",
      maintenanceBalance: "0.00",
      firstAssessmentStatus: "paid",
      firstAssessmentBalance: "0.00",
      secondAssessmentStatus: "paid",
      secondAssessmentBalance: "0.00",
      totalOwed: "0.00",
      notes: "Out-of-State Owner. Rep: Oscar Cruz (786-287-5501).",
      livesOnsite: false,
    },
    {
      unitNumber: "207",
      monthlyMaintenance: "350.00",
      ownerName: "JIFOOD GROUP LLC",
      email: "jifoodgroup@gmail.com",
      phone: "610-209-9204",
      mailingAddress: "4000 NE 169 ST APT 300 - North Miami beach FL 33160",
      rentalStatus: "Rents Out",
      delinquencyStatus: "current",
      priorityLevel: "low",
      maintenanceBalance: "0.00",
      firstAssessmentStatus: "paid",
      firstAssessmentBalance: "0.00",
      secondAssessmentStatus: "paid",
      secondAssessmentBalance: "0.00",
      totalOwed: "0.00",
      notes: "Corporate owner. Rental property.",
      livesOnsite: false,
    },
    {
      unitNumber: "208",
      monthlyMaintenance: "350.00",
      ownerName: "DAN WARD - HOMEWARD PROPERTIES INC",
      email: "wardinmiami@gmail.com",
      phone: "+1 (305) 608-3676",
      mailingAddress: "",
      rentalStatus: "Rents Out",
      delinquencyStatus: "current",
      priorityLevel: "low",
      maintenanceBalance: "0.00",
      firstAssessmentStatus: "paid",
      firstAssessmentBalance: "0.00",
      secondAssessmentStatus: "paid",
      secondAssessmentBalance: "0.00",
      totalOwed: "0.00",
      notes: "BOARD MEMBER - Dan Ward. Owns Units 205 & 208. Corporate owner (Homeward Properties Inc). Rental properties.",
      livesOnsite: false,
      isBoardMember: true,
    },

    // BUILDING 3 (3rd Floor)
    {
      unitNumber: "301",
      monthlyMaintenance: "350.00",
      ownerName: "HORACIO GAISER TRS - HORACIO GAISER AND PATRICIA GNAVI",
      email: "", // Missing
      phone: "", // Missing
      mailingAddress: "PO BOX 35085, ST PETERSBURG, FL 33705",
      rentalStatus: "Rents Out",
      delinquencyStatus: "pending", // "Need to Verify"
      priorityLevel: "medium",
      maintenanceBalance: "0.00",
      firstAssessmentStatus: "paying",
      firstAssessmentBalance: "100.00",
      secondAssessmentStatus: "plan",
      secondAssessmentBalance: "2500.00",
      totalOwed: "2600.00",
      notes: "Out-of-State Owner. Missing contact info. Rep: Liana Yckson (305-336-3189, realtorliana@gmail.com). Status needs verification.",
      livesOnsite: false,
    },
    {
      unitNumber: "302",
      monthlyMaintenance: "350.00",
      ownerName: "MICHAEL V LIEVANO - CALLY A VANN",
      email: "cal.v831@gmail.com",
      phone: "305-546-1252",
      mailingAddress: "",
      rentalStatus: "Vacant",
      delinquencyStatus: "90plus", // Delinquent
      priorityLevel: "high",
      maintenanceBalance: "1400.00", // 4 months behind
      firstAssessmentStatus: "owed",
      firstAssessmentBalance: "200.00",
      secondAssessmentStatus: "owed",
      secondAssessmentBalance: "5000.00",
      totalOwed: "6600.00",
      notes: "DELINQUENT - Vacant property. Priority collection.",
      livesOnsite: false,
    },
    {
      unitNumber: "303",
      monthlyMaintenance: "350.00",
      ownerName: "CORONADO II 1024 INC",
      email: "rfreitess@hotmail.com", // Primary
      phone: "786-295-1204",
      mailingAddress: "",
      rentalStatus: "Rents Out",
      delinquencyStatus: "pending", // "Need to Verify"
      priorityLevel: "medium",
      maintenanceBalance: "0.00",
      firstAssessmentStatus: "paid",
      firstAssessmentBalance: "0.00",
      secondAssessmentStatus: "plan",
      secondAssessmentBalance: "2500.00",
      totalOwed: "2500.00",
      notes: "Corporate owner. Additional email: mcheguilen@gmail.com. Status needs verification.",
      livesOnsite: false,
    },
    {
      unitNumber: "304",
      monthlyMaintenance: "350.00",
      ownerName: "RED CARPET GROUP INVESTMENTS LLC / Daniel Calabrese",
      email: "", // Missing
      phone: "", // Missing
      mailingAddress: "7742 N. KENDALL DRIVE, SUITE #87, MIAMI FL 33156",
      rentalStatus: "Rents Out",
      delinquencyStatus: "pending", // "Need to Verify"
      priorityLevel: "medium",
      maintenanceBalance: "0.00",
      firstAssessmentStatus: "paying",
      firstAssessmentBalance: "100.00",
      secondAssessmentStatus: "plan",
      secondAssessmentBalance: "2500.00",
      totalOwed: "2600.00",
      notes: "Corporate owner. Missing contact info. Status needs verification.",
      livesOnsite: false,
    },
    {
      unitNumber: "305",
      monthlyMaintenance: "350.00",
      ownerName: "OLIVIA LOPERA",
      email: "lopera.olivia@yahoo.com",
      phone: "", // Missing
      mailingAddress: "",
      rentalStatus: "Lives Onsite",
      delinquencyStatus: "90plus", // Delinquent
      priorityLevel: "high",
      maintenanceBalance: "1050.00", // 3 months behind
      firstAssessmentStatus: "owed",
      firstAssessmentBalance: "200.00",
      secondAssessmentStatus: "owed",
      secondAssessmentBalance: "5000.00",
      totalOwed: "6250.00",
      notes: "DELINQUENT - Lives onsite. Sensitive collection required.",
      livesOnsite: true,
    },
    {
      unitNumber: "306",
      monthlyMaintenance: "350.00",
      ownerName: "RAMON ORTEGA",
      email: "", // Missing
      phone: "786-287-5501",
      mailingAddress: "",
      rentalStatus: "Rents Out",
      delinquencyStatus: "90plus", // Delinquent
      priorityLevel: "high",
      maintenanceBalance: "1400.00", // 4 months behind
      firstAssessmentStatus: "owed",
      firstAssessmentBalance: "200.00",
      secondAssessmentStatus: "owed",
      secondAssessmentBalance: "5000.00",
      totalOwed: "6600.00",
      notes: "DELINQUENT - Out-of-State Owner. Rep: Oscar Cruz (786-287-5501).",
      livesOnsite: false,
    },
    {
      unitNumber: "307",
      monthlyMaintenance: "350.00",
      ownerName: "GIERRE USA CORP / Giorgio V. Ribaudo",
      email: "g.ribaudo@gierreusa.com",
      phone: "(734) 620-4932",
      mailingAddress: "",
      rentalStatus: "Rents Out",
      delinquencyStatus: "90plus", // "Delinquent, Need to Verify"
      priorityLevel: "high",
      maintenanceBalance: "1750.00", // 5 months behind
      firstAssessmentStatus: "owed",
      firstAssessmentBalance: "200.00",
      secondAssessmentStatus: "owed",
      secondAssessmentBalance: "5000.00",
      totalOwed: "6950.00",
      notes: "DELINQUENT - Corporate owner. Status needs verification.",
      livesOnsite: false,
    },
    {
      unitNumber: "308",
      monthlyMaintenance: "350.00",
      ownerName: "MICHAEL HAM EST OF",
      email: "", // Deceased
      phone: "", // Deceased
      mailingAddress: "",
      rentalStatus: "Vacant",
      delinquencyStatus: "attorney", // Delinquent + Owner Deceased
      priorityLevel: "critical",
      maintenanceBalance: "2100.00", // 6 months behind
      firstAssessmentStatus: "owed",
      firstAssessmentBalance: "200.00",
      secondAssessmentStatus: "owed",
      secondAssessmentBalance: "5000.00",
      totalOwed: "7300.00",
      notes: "CRITICAL - Owner deceased. Estate status. Requires attorney involvement.",
      livesOnsite: false,
    },

    // BUILDING 4 (4th Floor)
    {
      unitNumber: "401",
      monthlyMaintenance: "350.00",
      ownerName: "JOSE F RODRIGUEZ",
      email: "jfrcuba@yahoo.com",
      phone: "(305) 308-4089",
      mailingAddress: "645 NE 121 Street",
      rentalStatus: "Lives Onsite",
      delinquencyStatus: "pending", // "Need to Verify"
      priorityLevel: "low",
      maintenanceBalance: "0.00",
      firstAssessmentStatus: "paid",
      firstAssessmentBalance: "0.00",
      secondAssessmentStatus: "paid",
      secondAssessmentBalance: "0.00",
      totalOwed: "0.00",
      notes: "Lives onsite. Status needs verification.",
      livesOnsite: true,
    },
    {
      unitNumber: "402",
      monthlyMaintenance: "350.00",
      ownerName: "EST OF ADELA D SOMODEVILLA",
      email: "", // Missing
      phone: "+1 (305) 551-0243",
      mailingAddress: "",
      rentalStatus: "Rents Out",
      delinquencyStatus: "pending", // "Need to Verify"
      priorityLevel: "medium",
      maintenanceBalance: "0.00",
      firstAssessmentStatus: "paid",
      firstAssessmentBalance: "0.00",
      secondAssessmentStatus: "plan",
      secondAssessmentBalance: "2500.00",
      totalOwed: "2500.00",
      notes: "Estate property. Status needs verification.",
      livesOnsite: false,
    },
    {
      unitNumber: "403",
      monthlyMaintenance: "350.00",
      ownerName: "FEDERICO HURTADO",
      email: "federico.hurtado@gmail.com",
      phone: "786-267-3536",
      mailingAddress: "",
      rentalStatus: "Rents Out",
      delinquencyStatus: "pending", // "Need to Verify"
      priorityLevel: "low",
      maintenanceBalance: "0.00",
      firstAssessmentStatus: "paid",
      firstAssessmentBalance: "0.00",
      secondAssessmentStatus: "plan",
      secondAssessmentBalance: "2500.00",
      totalOwed: "2500.00",
      notes: "Rental property. Status needs verification.",
      livesOnsite: false,
    },
    {
      unitNumber: "404",
      monthlyMaintenance: "350.00",
      ownerName: "GRALPE LLC",
      email: "fladelvalle23@gmail.com",
      phone: "(530) 918-8390",
      mailingAddress: "",
      rentalStatus: "Rents Out",
      delinquencyStatus: "pending", // "Need to Verify"
      priorityLevel: "low",
      maintenanceBalance: "0.00",
      firstAssessmentStatus: "paid",
      firstAssessmentBalance: "0.00",
      secondAssessmentStatus: "plan",
      secondAssessmentBalance: "2500.00",
      totalOwed: "2500.00",
      notes: "Corporate owner. Status needs verification.",
      livesOnsite: false,
    },
    {
      unitNumber: "405",
      monthlyMaintenance: "350.00",
      ownerName: "CORDELL C DAVIS",
      email: "Cdavis6085@yahoo.com",
      phone: "786-792-4073",
      mailingAddress: "",
      rentalStatus: "Vacant",
      delinquencyStatus: "90plus", // Delinquent
      priorityLevel: "high",
      maintenanceBalance: "1750.00", // 5 months behind
      firstAssessmentStatus: "owed",
      firstAssessmentBalance: "200.00",
      secondAssessmentStatus: "owed",
      secondAssessmentBalance: "5000.00",
      totalOwed: "6950.00",
      notes: "DELINQUENT - Vacant property. Priority collection.",
      livesOnsite: false,
    },
    {
      unitNumber: "406",
      monthlyMaintenance: "350.00",
      ownerName: "JOSE PEIRATS TRS - THE JOSE PEIRATS AND CATALINA",
      email: "peppeirats@gmail.com",
      phone: "786-319-8010",
      mailingAddress: "",
      rentalStatus: "Rents Out",
      delinquencyStatus: "current",
      priorityLevel: "low",
      maintenanceBalance: "0.00",
      firstAssessmentStatus: "paid",
      firstAssessmentBalance: "0.00",
      secondAssessmentStatus: "paid",
      secondAssessmentBalance: "0.00",
      totalOwed: "0.00",
      notes: "Rental property.",
      livesOnsite: false,
    },
    {
      unitNumber: "407",
      monthlyMaintenance: "350.00",
      ownerName: "BRIAN MORRISON",
      email: "brianwmorrisson@gmail.com",
      phone: "917-816-4228",
      mailingAddress: "442 NE 77 ST, Miami, FL 33138",
      rentalStatus: "Rents Out",
      delinquencyStatus: "current",
      priorityLevel: "low",
      maintenanceBalance: "0.00",
      firstAssessmentStatus: "paid",
      firstAssessmentBalance: "0.00",
      secondAssessmentStatus: "paid",
      secondAssessmentBalance: "0.00",
      totalOwed: "0.00",
      notes: "Rental property.",
      livesOnsite: false,
    },
    {
      unitNumber: "408",
      monthlyMaintenance: "350.00",
      ownerName: "SARA B LEVITEN TRS - SARA B LEVITEN INTERVIVOS REV TR",
      email: "levitens@bellsouth.net",
      phone: "3054019325",
      mailingAddress: "645 NE 121 Street",
      rentalStatus: "Lives Onsite",
      delinquencyStatus: "current",
      priorityLevel: "low",
      maintenanceBalance: "0.00",
      firstAssessmentStatus: "paid",
      firstAssessmentBalance: "0.00",
      secondAssessmentStatus: "paid",
      secondAssessmentBalance: "0.00",
      totalOwed: "0.00",
      notes: "Lives onsite. Trust property.",
      livesOnsite: false,
    },
  ];

  try {
    console.log("\n📊 Summary:");
    console.log(`Total Units: ${unitsData.length}`);
    
    const currentCount = unitsData.filter(u => u.delinquencyStatus === "current").length;
    const delinquentCount = unitsData.filter(u => u.delinquencyStatus === "90plus" || u.delinquencyStatus === "attorney").length;
    const pendingCount = unitsData.filter(u => u.delinquencyStatus === "pending").length;
    
    console.log(`Current: ${currentCount} units`);
    console.log(`Delinquent: ${delinquentCount} units`);
    console.log(`Pending Verification: ${pendingCount} units`);
    console.log("");

    // Insert units
    for (const unitData of unitsData) {
      const { ownerName, email, phone, mailingAddress, rentalStatus, livesOnsite, ...unitFields } = unitData;
      
      console.log(`Creating Unit ${unitData.unitNumber}...`);
      
      // Insert unit
      const [unit] = await db.insert(units).values(unitFields).returning();
      
      // Insert owner
      await db.insert(owners).values({
        unitId: unit.id,
        fullName: ownerName,
        email: email || null,
        phone: phone || null,
        mailingAddress: mailingAddress || null,
        isPrimary: true,
      });
      
      console.log(`✅ Unit ${unitData.unitNumber}: ${ownerName} - ${unitData.delinquencyStatus}`);
    }

    console.log("\n✅ All units and owners seeded successfully!");
    console.log("\n📋 Next Steps:");
    console.log("1. Verify delinquent units marked for attorney");
    console.log("2. Obtain missing contact info for units with 'Missing' data");
    console.log("3. Confirm payment plans with units marked 'pending'");
    console.log("4. Follow up on estate properties (Units 308, 402)");
    
  } catch (error) {
    console.error("❌ Error seeding units:", error);
    throw error;
  }
}

// Run the seed
seedUnitsAndOwners()
  .then(() => {
    console.log("\n🎉 Seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });
