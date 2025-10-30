import "dotenv/config";
import { db } from "../server/db";
import { units } from "../shared/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

/**
 * Import SA#2 (2024 Assessment) Prior Balances from CSV
 *
 * CSV Format:
 * Unit,Owner,SA#2 Prior Balance (June 2025)
 * 201,Jose Peirats,1234.56
 *
 * This updates the sa2_prior_balance field for each unit.
 */

interface CSVRow {
  unit: string;
  owner: string;
  priorBalance: string;
}

function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.trim().split('\n');
  const rows: CSVRow[] = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',');
    if (parts.length < 3) {
      console.log(`⚠️ Skipping invalid line: ${line}`);
      continue;
    }

    rows.push({
      unit: parts[0].trim(),
      owner: parts[1].trim(),
      priorBalance: parts[2].trim(),
    });
  }

  return rows;
}

async function importSA2PriorBalances() {
  console.log("📊 Importing SA#2 (2024 Assessment) Prior Balances from CSV...\n");

  // Check if file exists
  const csvPath = path.join(process.cwd(), 'public/templates/sa2-prior-balance-template.csv');

  if (!fs.existsSync(csvPath)) {
    console.error("❌ CSV file not found at:", csvPath);
    console.log("\n💡 Please create the file with this format:");
    console.log("Unit,Owner,SA#2 Prior Balance (June 2025)");
    console.log("201,Jose Peirats,1234.56");
    console.log("202,Joane Aristilde,0.00");
    process.exit(1);
  }

  try {
    // Read CSV
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCSV(csvContent);

    console.log(`📋 Found ${rows.length} units in CSV\n`);

    let updated = 0;
    let skipped = 0;

    for (const row of rows) {
      try {
        // Find unit
        const existingUnit = await db
          .select()
          .from(units)
          .where(eq(units.unitNumber, row.unit))
          .limit(1);

        if (existingUnit.length === 0) {
          console.log(`⚠️ Unit ${row.unit} not found in database, skipping...`);
          skipped++;
          continue;
        }

        // Parse prior balance
        const priorBalance = parseFloat(row.priorBalance);
        if (isNaN(priorBalance)) {
          console.log(`⚠️ Invalid prior balance for Unit ${row.unit}: "${row.priorBalance}", skipping...`);
          skipped++;
          continue;
        }

        // Update unit with SA#2 prior balance
        await db
          .update(units)
          .set({
            sa2PriorBalance: row.priorBalance,
          })
          .where(eq(units.unitNumber, row.unit));

        console.log(`✅ Unit ${row.unit}: Set SA#2 prior balance to $${priorBalance.toFixed(2)}`);
        updated++;

      } catch (error) {
        console.error(`❌ Error updating Unit ${row.unit}:`, error);
        skipped++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Import Summary:");
    console.log("=".repeat(60));
    console.log(`✅ Updated: ${updated} units`);
    console.log(`⚠️ Skipped: ${skipped} units`);
    console.log("=".repeat(60));

    console.log("\n🎉 Import complete!");
    console.log("\n💡 Next step: Refresh the Units page to see the SA#2 prior balances!");

  } catch (error) {
    console.error("❌ Error importing SA#2 prior balances:", error);
    throw error;
  }

  process.exit(0);
}

importSA2PriorBalances();
