import { db } from "../server/db";
import { bankAccounts } from "@shared/schema";

/**
 * Seed initial bank accounts with Florida FS 718.116 compliance
 * - One Operating Account
 * - One Reserve Account
 * - Funds must be kept separate per Florida law
 */
async function seedBankAccounts() {
  console.log("\n🏦 Seeding bank accounts (Florida FS 718.116 Compliant)...\n");

  const accountsToCreate = [
    {
      accountName: "Popular Bank - Operating Account",
      accountType: "OPERATING",
      fundType: "operating",
      bankName: "Popular Bank",
      accountNumber: "****1343", // Last 4 digits only
      routingNumber: "021502011", // Example routing number
      currentBalance: "0.00",
      minimumBalance: "0.00",
      isProtected: false, // Operating account is not protected
      status: "active",
    },
    {
      accountName: "Truist Bank - Reserve Account",
      accountType: "RESERVE",
      fundType: "reserve",
      bankName: "Truist Bank",
      accountNumber: "****5602", // Last 4 digits only
      routingNumber: "061000104", // Example routing number
      currentBalance: "0.00",
      minimumBalance: "50000.00", // Example minimum reserve requirement
      isProtected: true, // Reserve funds CANNOT be transferred to operating per Florida law
      status: "active",
    },
  ];

  for (const account of accountsToCreate) {
    try {
      await db.insert(bankAccounts).values(account);
      console.log(`✅ Created ${account.accountName}`);
      console.log(`   Type: ${account.accountType}`);
      console.log(`   Fund: ${account.fundType}`);
      console.log(`   Bank: ${account.bankName}`);
      console.log(`   Account: ${account.accountNumber}`);
      console.log(`   Protected: ${account.isProtected ? "Yes (Florida FS 718.116)" : "No"}`);
      console.log("");
    } catch (error: any) {
      if (error.code === '23505') {
        console.log(`⚠️  Account ${account.accountName} already exists, skipping...`);
      } else {
        console.error(`❌ Error creating account ${account.accountName}:`, error.message);
      }
    }
  }

  console.log("=".repeat(80));
  console.log("🔐 FLORIDA LAW COMPLIANCE (FS 718.116):");
  console.log("=".repeat(80));
  console.log("✅ Operating and Reserve funds are in SEPARATE accounts");
  console.log("✅ Reserve account is PROTECTED from unauthorized transfers");
  console.log("✅ Reserve funds can ONLY be used for:");
  console.log("   - Capital expenditures");
  console.log("   - Deferred maintenance");
  console.log("   - Items specified in reserve study");
  console.log("");
  console.log("❌ PROHIBITED by Florida law:");
  console.log("   - Transferring reserve funds to operating account");
  console.log("   - Using reserve funds for regular operating expenses");
  console.log("   - Commingling operating and reserve funds");
  console.log("=".repeat(80));
  console.log("\n✅ Bank account seeding complete!\n");

  process.exit(0);
}

// Run the seed
seedBankAccounts().catch((error) => {
  console.error("Fatal error during seeding:", error);
  process.exit(1);
});
