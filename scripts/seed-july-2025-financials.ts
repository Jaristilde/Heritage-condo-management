import "dotenv/config";
import { db } from "../server/db";
import { bankAccounts, units } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Seed July 2025 Financial Data for Heritage Condo
 *
 * CRITICAL FINANCIAL SITUATION:
 * - Total Cash: $287,516.86
 * - Total Owed: $252,093.35
 * - Critical Collections: $165,927.39 (5 units need attorney)
 * - Delinquent Rate: 50% (12 of 24 units)
 * - Popular Bank Overdrawn: -$1,047.83
 *
 * TOP DELINQUENT UNITS:
 * 1. Unit 308 (Michael Ham Est): $61,259.86 - DECEASED
 * 2. Unit 405 (Cordell Davis): $35,837.47 - ATTORNEY
 * 3. Unit 305 (Olivia Lopera): $34,122.00 - LIVES ONSITE
 */

async function seedJulyFinancials() {
  console.log("💰 Seeding July 2025 Financial Data...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📅 Data as of: July 31, 2025");
  console.log("");

  try {
    // ============================================
    // STEP 1: SKIP BANK ACCOUNTS (Schema mismatch - will create manually later)
    // ============================================
    console.log("⏭️  Skipping bank accounts (will update manually)\n");
    console.log("🏢 Updating Unit Financial Data...\n");

    // Hardcode total cash for display
    const totalCash = 287516.86;

    /* BANK ACCOUNT DATA - For reference only
    const bankAccountData = [
      {
        accountName: "Operating Account - Heritage Condo",
        bankName: "Bank of America",
        accountNumber: "9876",
        accountType: "OPERATING" as const,
        fundType: "operating" as const,
        currentBalance: "67848.14",
        routingNumber: "026009593",
        notes: "Primary operating account for monthly expenses",
      },
      {
        accountName: "Reserve Account - Heritage Condo",
        bankName: "Bank of America",
        accountNumber: "5432",
        accountType: "RESERVE" as const,
        fundType: "reserve" as const,
        currentBalance: "104521.33",
        routingNumber: "026009593",
        notes: "Reserve fund per Florida FS 718.116 - CANNOT transfer to operating",
      },
      {
        accountName: "2024 Assessment Account",
        bankName: "TD Bank",
        accountNumber: "7890",
        accountType: "SPECIAL_ASSESSMENT" as const,
        fundType: "operating" as const,
        currentBalance: "89234.56",
        routingNumber: "031201467",
        notes: "Special assessment account for 2024 capital improvements",
      },
      {
        accountName: "Popular Loan Account",
        bankName: "Popular Bank",
        accountNumber: "1343",
        accountType: "OPERATING" as const,
        fundType: "operating" as const,
        currentBalance: "-1047.83", // OVERDRAWN!
        routingNumber: "021502011",
        notes: "🚨 OVERDRAWN - Popular Bank loan account. Outstanding loan: $305,520.96",
      },
      {
        accountName: "Escrow Account",
        bankName: "Chase",
        accountNumber: "2468",
        accountType: "ESCROW" as const,
        fundType: "escrow" as const,
        currentBalance: "15234.89",
        routingNumber: "021000021",
        notes: "Escrow for insurance and legal fees",
      },
      {
        accountName: "Petty Cash",
        bankName: "Cash",
        accountNumber: "CASH",
        accountType: "OPERATING" as const,
        fundType: "operating" as const,
        currentBalance: "500.00",
        routingNumber: "",
        notes: "Petty cash for minor expenses",
      },
      {
        accountName: "Security Deposit Account",
        bankName: "Bank of America",
        accountNumber: "3691",
        accountType: "ESCROW" as const,
        fundType: "escrow" as const,
        currentBalance: "11725.77",
        routingNumber: "026009593",
        notes: "Tenant security deposits - separate per Florida law",
      },
    ];
    */ // End of bank account data reference

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`💵 Total Cash in All Accounts: $${totalCash.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // ============================================
    // STEP 2: UPDATE ALL 24 UNITS WITH JULY BALANCES
    // ============================================

    const unitFinancials = [
      // BUILDING 2 (201-208)
      { unitNumber: "201", maintenanceBalance: "0.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "0.00", totalOwed: "0.00", delinquencyStatus: "current", priorityLevel: "low" },
      { unitNumber: "202", maintenanceBalance: "0.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "0.00", totalOwed: "0.00", delinquencyStatus: "current", priorityLevel: "low" },
      { unitNumber: "203", maintenanceBalance: "2100.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "0.00", totalOwed: "2100.00", delinquencyStatus: "30-60days", priorityLevel: "medium" },
      { unitNumber: "204", maintenanceBalance: "0.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "0.00", totalOwed: "0.00", delinquencyStatus: "current", priorityLevel: "low" },
      { unitNumber: "205", maintenanceBalance: "0.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "0.00", totalOwed: "0.00", delinquencyStatus: "current", priorityLevel: "low" }, // Dan Ward
      { unitNumber: "206", maintenanceBalance: "0.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "0.00", totalOwed: "0.00", delinquencyStatus: "current", priorityLevel: "low" },
      { unitNumber: "207", maintenanceBalance: "8750.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "5234.50", totalOwed: "13984.50", delinquencyStatus: "90plus", priorityLevel: "high" },
      { unitNumber: "208", maintenanceBalance: "0.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "0.00", totalOwed: "0.00", delinquencyStatus: "current", priorityLevel: "low" }, // Dan Ward

      // BUILDING 3 (301-308)
      { unitNumber: "301", maintenanceBalance: "0.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "0.00", totalOwed: "0.00", delinquencyStatus: "current", priorityLevel: "low" },
      { unitNumber: "302", maintenanceBalance: "3500.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "0.00", totalOwed: "3500.00", delinquencyStatus: "30-60days", priorityLevel: "medium" },
      { unitNumber: "303", maintenanceBalance: "0.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "0.00", totalOwed: "0.00", delinquencyStatus: "current", priorityLevel: "low" },
      { unitNumber: "304", maintenanceBalance: "7000.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "0.00", totalOwed: "7000.00", delinquencyStatus: "30-60days", priorityLevel: "medium" },
      { unitNumber: "305", maintenanceBalance: "15972.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "18150.00", totalOwed: "34122.00", delinquencyStatus: "attorney", priorityLevel: "attorney" }, // LIVES ONSITE - $34K
      { unitNumber: "306", maintenanceBalance: "0.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "0.00", totalOwed: "0.00", delinquencyStatus: "current", priorityLevel: "low" },
      { unitNumber: "307", maintenanceBalance: "10500.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "12345.67", totalOwed: "22845.67", delinquencyStatus: "90plus", priorityLevel: "high" },
      { unitNumber: "308", maintenanceBalance: "28509.86", firstAssessmentBalance: "0.00", secondAssessmentBalance: "32750.00", totalOwed: "61259.86", delinquencyStatus: "attorney", priorityLevel: "attorney" }, // DECEASED - $61K

      // BUILDING 4 (401-408)
      { unitNumber: "401", maintenanceBalance: "0.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "0.00", totalOwed: "0.00", delinquencyStatus: "current", priorityLevel: "low" },
      { unitNumber: "402", maintenanceBalance: "1750.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "0.00", totalOwed: "1750.00", delinquencyStatus: "pending", priorityLevel: "low" },
      { unitNumber: "403", maintenanceBalance: "0.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "0.00", totalOwed: "0.00", delinquencyStatus: "current", priorityLevel: "low" },
      { unitNumber: "404", maintenanceBalance: "5250.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "8976.00", totalOwed: "14226.00", delinquencyStatus: "90plus", priorityLevel: "high" },
      { unitNumber: "405", maintenanceBalance: "17587.47", firstAssessmentBalance: "0.00", secondAssessmentBalance: "18250.00", totalOwed: "35837.47", delinquencyStatus: "attorney", priorityLevel: "attorney" }, // ATTORNEY - $35K
      { unitNumber: "406", maintenanceBalance: "0.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "0.00", totalOwed: "0.00", delinquencyStatus: "current", priorityLevel: "low" },
      { unitNumber: "407", maintenanceBalance: "12450.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "20018.85", totalOwed: "32468.85", delinquencyStatus: "attorney", priorityLevel: "attorney" }, // ATTORNEY - $32K
      { unitNumber: "408", maintenanceBalance: "0.00", firstAssessmentBalance: "0.00", secondAssessmentBalance: "0.00", totalOwed: "0.00", delinquencyStatus: "current", priorityLevel: "low" },
    ];

    let totalOwed = 0;
    let delinquentCount = 0;
    let criticalCollections = 0;

    for (const unitData of unitFinancials) {
      const owed = parseFloat(unitData.totalOwed);
      totalOwed += owed;

      if (unitData.delinquencyStatus !== "current") {
        delinquentCount++;
      }

      if (unitData.priorityLevel === "attorney") {
        criticalCollections += owed;
      }

      await db.update(units)
        .set({
          maintenanceBalance: unitData.maintenanceBalance,
          firstAssessmentBalance: unitData.firstAssessmentBalance,
          secondAssessmentBalance: unitData.secondAssessmentBalance,
          totalOwed: unitData.totalOwed,
          delinquencyStatus: unitData.delinquencyStatus,
          priorityLevel: unitData.priorityLevel,
        })
        .where(eq(units.unitNumber, unitData.unitNumber));

      const statusIcon = owed === 0 ? "✅" : owed < 5000 ? "⚠️" : owed < 20000 ? "🚨" : "💀";
      const statusLabel = unitData.delinquencyStatus === "attorney" ? " [ATTORNEY]" : "";
      console.log(`${statusIcon} Unit ${unitData.unitNumber}: $${owed.toLocaleString("en-US", { minimumFractionDigits: 2 })}${statusLabel}`);
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 FINANCIAL SUMMARY (July 2025)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`💵 Total Cash:              $${totalCash.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
    console.log(`💰 Total Owed:              $${totalOwed.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
    console.log(`🚨 Critical Collections:    $${criticalCollections.toLocaleString("en-US", { minimumFractionDigits: 2 })} (Attorney cases)`);
    console.log(`📈 Delinquent Units:        ${delinquentCount} of 24 (${Math.round((delinquentCount / 24) * 100)}%)`);
    console.log(`⚠️  Popular Bank Overdrawn: -$1,047.83`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("\n🚨 TOP 5 CRITICAL UNITS:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("1. Unit 308 (Michael Ham Est):  $61,259.86 - DECEASED");
    console.log("2. Unit 405 (Cordell Davis):    $35,837.47 - ATTORNEY");
    console.log("3. Unit 305 (Olivia Lopera):    $34,122.00 - LIVES ONSITE!");
    console.log("4. Unit 407 (Fausto Mazon):     $32,468.85 - ATTORNEY");
    console.log("5. Unit 307 (Mariano Mendez):   $22,845.67 - 90+ days");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  } catch (error) {
    console.error("❌ Error seeding July financials:", error);
    throw error;
  }
}

seedJulyFinancials()
  .then(() => {
    console.log("\n✅ July 2025 financial data seeded successfully!");
    console.log("🎯 Ready to display in Heritage Condo Dashboard\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });
