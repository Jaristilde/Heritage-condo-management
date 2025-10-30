import { config } from "dotenv";
config();

import { db } from "../server/db";
import { units, reportImports, popularLoans } from "../shared/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

/**
 * IMPORT FINANCIAL DATA FROM CSV
 *
 * Usage: npx dotenv-cli npx tsx scripts/import-financial-data.ts <path-to-csv>
 *
 * CSV Format:
 * Unit,Owner,Monthly Maintenance,Popular Loan,2024 Assessment,Total Owed,Status
 */

interface ImportRow {
  Unit: string;
  Owner: string;
  "Monthly Maintenance": string;
  "Popular Loan": string;
  "2024 Assessment": string;
  "Total Owed": string;
  Status: string;
}

function parseCSV(content: string): ImportRow[] {
  const lines = content.trim().split("\n");
  const headers = lines[0].split(",");

  return lines.slice(1).map(line => {
    const values = line.split(",");
    const row: any = {};
    headers.forEach((header, i) => {
      row[header] = values[i];
    });
    return row as ImportRow;
  });
}

async function importFinancialData(csvPath: string) {
  console.log("🔧 IMPORTING FINANCIAL DATA");
  console.log("=".repeat(70));
  console.log("");

  try {
    // Read CSV file
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const rows = parseCSV(csvContent);

    console.log(`📄 Found ${rows.length} units in CSV file\n`);

    // Get first admin user for imported_by
    const adminUsers = await db.query.users.findMany({
      where: (users, { or, eq }) => or(
        eq(users.role, 'super_admin'),
        eq(users.role, 'board_secretary')
      ),
      limit: 1
    });

    if (!adminUsers || adminUsers.length === 0) {
      throw new Error("No admin user found in database. Please create an admin user first.");
    }

    const adminUserId = adminUsers[0].id;
    console.log(`Using admin user: ${adminUsers[0].username} (${adminUserId})\n`);

    // Create report import record
    const reportImport = await db.insert(reportImports).values({
      vendor: "Juda Eskew",
      periodMonth: new Date().getMonth() + 1,
      periodYear: new Date().getFullYear(),
      filename: path.basename(csvPath),
      importedBy: adminUserId,
      notes: "Automated import from CSV",
    }).returning();

    console.log(`✅ Created report import record: ${reportImport[0].id}\n`);

    let updatedCount = 0;
    let loanCount = 0;

    // Process each row
    for (const row of rows) {
      const unitNumber = row.Unit;
      const popularLoanAmount = parseFloat(row["Popular Loan"] || "0");
      const assessment2024 = parseFloat(row["2024 Assessment"] || "0");
      const totalOwed = parseFloat(row["Total Owed"] || "0");
      const maintenanceFee = parseFloat(row["Monthly Maintenance"] || "0");

      // Determine assessment status
      let assessmentStatus = "PARTIAL";
      if (assessment2024 === 0) {
        assessmentStatus = "PAID IN FULL";
      } else if (assessment2024 >= 11920.92) {
        assessmentStatus = "UNPAID";
      } else if (row.Status.includes("3-Year Plan") || row.Status.includes("Plan")) {
        assessmentStatus = "3-YEAR PLAN";
      }

      // Update unit
      await db.update(units)
        .set({
          monthlyMaintenance: maintenanceFee.toFixed(2),
          monthlyPopularLoan: popularLoanAmount.toFixed(2),
          assessment2024Remaining: assessment2024.toFixed(2),
          assessment2024Status: assessmentStatus,
          totalOwed: totalOwed.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(units.unitNumber, unitNumber));

      updatedCount++;

      // Create/update popular loan record if amount > 0
      if (popularLoanAmount > 0) {
        const loanStatus = popularLoanAmount === 0 ? "PAID" : "OWES";

        await db.insert(popularLoans).values({
          unit: unitNumber,
          loanNumber: null, // Will be filled in later from detailed report
          lender: "Popular Bank",
          status: loanStatus,
          currentBalance: popularLoanAmount.toFixed(2),
          lastPaymentDate: null,
          sourceReportId: reportImport[0].id,
        });

        loanCount++;
      }

      console.log(`  ✓ Updated Unit ${unitNumber}: Assessment $${assessment2024.toFixed(2)}, Total Owed $${totalOwed.toFixed(2)}`);
    }

    console.log("");
    console.log("=".repeat(70));
    console.log(`✅ Import completed successfully!`);
    console.log(`   Units updated: ${updatedCount}`);
    console.log(`   Popular loans recorded: ${loanCount}`);
    console.log("=".repeat(70));

  } catch (error) {
    console.error("");
    console.error("❌ Import failed:", error);
    console.error("");
    throw error;
  }
}

// Get CSV path from command line
const csvPath = process.argv[2] || path.join(__dirname, "../public/templates/juda-eskew-import-template.csv");

if (!fs.existsSync(csvPath)) {
  console.error(`❌ File not found: ${csvPath}`);
  console.error("\nUsage: npx dotenv-cli npx tsx scripts/import-financial-data.ts <path-to-csv>");
  process.exit(1);
}

importFinancialData(csvPath)
  .then(() => {
    console.log("\n✅ Financial data import completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Financial data import failed:", error);
    process.exit(1);
  });
