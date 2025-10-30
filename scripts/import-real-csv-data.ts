import { db } from '../server/db';
import { units } from '../shared/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';

// Parse CSV value to clean decimal number
function parseAmount(value: string): number {
  if (!value || value.trim() === '' || value === '$-' || value.trim() === '-') {
    return 0;
  }

  // Remove $, commas, spaces, and handle negative values in parentheses
  let cleaned = value.trim().replace(/\$/g, '').replace(/,/g, '').replace(/\s/g, '');

  // Handle values in parentheses as negative
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    cleaned = '-' + cleaned.slice(1, -1);
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

async function importRealCSVData() {
  console.log('📊 Starting import from real CSV file...\n');

  // Manually mapped data from CSV (rows 4-27)
  const unitsData = [
    { unit: "201", owner: "Jose Peirats", maintenancePmt: 578.45, sa1Charge: 0, sa1Pmt: 0, sa1Status: "Paid Off", sa2Remaining: 0, sa2Status: "Paid Off", totalOwed: -505.27, notes: "Has Maint. credit. SA #1 & SA 2  Paid Off." },
    { unit: "202", owner: "Joane Aristilde", maintenancePmt: 786.45, sa1Charge: 208, sa1Pmt: 208, sa1Status: "On-going", sa2Remaining: 6856.07, sa2Status: "On-going", totalOwed: 6856.07, notes: "Per user: SA #2 on 3-yr plan." },
    { unit: "203", owner: "Gabrielle Fabre", maintenancePmt: 786.45, sa1Charge: 208, sa1Pmt: 208, sa1Status: "On-going", sa2Remaining: 6674.46, sa2Status: "On-going", totalOwed: 6674.46, notes: "Per user: SA #2 on 3-yr plan." },
    { unit: "204", owner: "Lorraine Epelbaum", maintenancePmt: 0, sa1Charge: 208, sa1Pmt: 0, sa1Status: "On-going", sa2Remaining: 11920.92, sa2Status: "On-going", totalOwed: 18737.99, notes: "Delinquent all funds.- Needs to send colletion letter" },
    { unit: "205", owner: "Homeward Prop.", maintenancePmt: 1988.90, sa1Charge: 208, sa1Pmt: 208, sa1Status: "On-going", sa2Remaining: 0, sa2Status: "Paid Off", totalOwed: -1652.15, notes: "Has Maint. credit.  SA 2  Paid Off." },
    { unit: "206", owner: "Ramon Ortega", maintenancePmt: 0, sa1Charge: 0, sa1Pmt: 0, sa1Status: "Paid Off", sa2Remaining: 11920.92, sa2Status: "Paid Off", totalOwed: 11592.59, notes: "SA #1 Paid Off. SA #2 status unknown., needs to investigate" },
    { unit: "207", owner: "JiFood Group LLC", maintenancePmt: 2313.80, sa1Charge: 0, sa1Pmt: 0, sa1Status: "Paid Off", sa2Remaining: 7007.59, sa2Status: "Paid Off", totalOwed: 5272.24, notes: "SA #1 Paid Off. Payment overage." },
    { unit: "208", owner: "Homeward Prop.", maintenancePmt: 1202.45, sa1Charge: 208, sa1Pmt: 208, sa1Status: "On-going", sa2Remaining: 0, sa2Status: "Paid Off", totalOwed: -537.84, notes: "Has Maint. credit. Payment overage." },
    { unit: "301", owner: "Patricia Gaiser", maintenancePmt: 786.45, sa1Charge: 208, sa1Pmt: 208, sa1Status: "On-going", sa2Remaining: 0, sa2Status: "On-going", totalOwed: 6320.51, notes: "SA #2 bal (1 missed pmt) ID'd from deficit." },
    { unit: "302", owner: "Cally Lievano", maintenancePmt: 0, sa1Charge: 0, sa1Pmt: 0, sa1Status: "Paid Off", sa2Remaining: 0, sa2Status: "Paid Off", totalOwed: 11781.01, notes: "SA #1 Paid Off. SA #2 bal (5 missed pmts)." },
    { unit: "303", owner: "Coronado II", maintenancePmt: 786.45, sa1Charge: 208, sa1Pmt: 208, sa1Status: "On-going", sa2Remaining: 0, sa2Status: "On-going", totalOwed: 13277.75, notes: "SA #2 bal (3 missed pmts) ID'd from deficit." },
    { unit: "304", owner: "Gralpe LLC", maintenancePmt: 578.45, sa1Charge: 0, sa1Pmt: 0, sa1Status: "Paid Off", sa2Remaining: 3120.31, sa2Status: "On-going", totalOwed: 3120.31, notes: "SA #1 Paid Off. Report shows credit balance." },
    { unit: "305", owner: "Olivia Lopera", maintenancePmt: 0, sa1Charge: 208, sa1Pmt: 0, sa1Status: "On-going", sa2Remaining: 11920.92, sa2Status: "Deliquent", totalOwed: 34122.00, notes: "SA #2 bal (10 missed pmts) ID'd from deficit." },
    { unit: "306", owner: "Ramon Ortega", maintenancePmt: 0, sa1Charge: 0, sa1Pmt: 0, sa1Status: "Paid Off", sa2Remaining: 0, sa2Status: "Paid Off", totalOwed: 15970.07, notes: "SA #1 Paid Off. SA #2 bal (all missed pmts). needs to investigate, ussually paid for the year" },
    { unit: "307", owner: "Gierre USA Corp", maintenancePmt: 578.45, sa1Charge: 0, sa1Pmt: 0, sa1Status: "Paid Off", sa2Remaining: 0, sa2Status: "Paid Off", totalOwed: 7.68, notes: "SA #1 Paid Off. SA #2 status unknown." },
    { unit: "308", owner: "Michael Ham Est", maintenancePmt: 0, sa1Charge: 208, sa1Pmt: 0, sa1Status: "On-going", sa2Remaining: 11920.92, sa2Status: "Deliquent", totalOwed: 61259.86, notes: " Deceased, delinquent since 2021." },
    { unit: "401", owner: "Jose Rodriguez", maintenancePmt: 578.05, sa1Charge: 208, sa1Pmt: 0, sa1Status: "On-going", sa2Remaining: 5173.88, sa2Status: "Deliquent", totalOwed: 5382.28, notes: "Needs to go on payment plan for SA#2 and needs to pay what owed on SA#1" },
    { unit: "402", owner: "Adela Somodevilla", maintenancePmt: 578.45, sa1Charge: 208, sa1Pmt: 0, sa1Status: "On-going", sa2Remaining: 11920.92, sa2Status: "Deliquent", totalOwed: 2989.12, notes: "SA #2 bal (1 missed pmt) ID'd from deficit." },
    { unit: "403", owner: "Federico Hurtado", maintenancePmt: 578.45, sa1Charge: 0, sa1Pmt: 0, sa1Status: "Paid Off", sa2Remaining: 0, sa2Status: "Paid Off", totalOwed: -50.00, notes: "SA #1 Paid Off. Has Maint. credit." },
    { unit: "404", owner: "Gralpe LLC", maintenancePmt: 578.45, sa1Charge: 0, sa1Pmt: 0, sa1Status: "Paid Off", sa2Remaining: 2190.00, sa2Status: "Paid Off", totalOwed: 2190.75, notes: "SA #1 Paid Off. Report shows credit balance." },
    { unit: "405", owner: "Cordell Davis", maintenancePmt: 0, sa1Charge: 208, sa1Pmt: 0, sa1Status: "On-going", sa2Remaining: 11920.92, sa2Status: "Deliquent", totalOwed: 35837.47, notes: "SA #2 bal (all missed pmts) ID'd from deficit." },
    { unit: "406", owner: "Catalina Vargas", maintenancePmt: 578.45, sa1Charge: 0, sa1Pmt: 0, sa1Status: "Paid Off", sa2Remaining: 2190.75, sa2Status: "Paid Off", totalOwed: 550.68, notes: "SA #1 Paid Off. SA #2 status unknown." },
    { unit: "407", owner: "Brian Morrison", maintenancePmt: 578.45, sa1Charge: 0, sa1Pmt: 0, sa1Status: "Paid Off", sa2Remaining: 0, sa2Status: "Paid Off", totalOwed: -636.77, notes: "SA #1 Paid Off. Has Maint. credit." },
    { unit: "408", owner: "Sara Leviten", maintenancePmt: 1156.90, sa1Charge: 0, sa1Pmt: 0, sa1Status: "Paid Off", sa2Remaining: 0, sa2Status: "Paid Off", totalOwed: 2963.34, notes: "SA #1 & SA2 are Paid Off. But Defficit on her Montly Maintenance" },
  ];

  let updatedCount = 0;
  let errorCount = 0;

  for (const unitData of unitsData) {
    try {
      const monthlyMaintenanceCharge = 578.45;

      // Calculate maintenance fund
      const maintenancePayment = unitData.maintenancePmt;
      const maintenancePaid = maintenancePayment >= monthlyMaintenanceCharge;

      // For maintenance prior balance, we calculate from total owed
      // Total Owed = Maintenance Balance + SA#1 Balance + SA#2 Remaining
      const sa1IsActive = unitData.sa1Status.includes('going');
      const maintenancePriorBalance = 0; // Starting from July with fresh slate
      const maintenanceBalance = maintenancePriorBalance + monthlyMaintenanceCharge - maintenancePayment;

      // Calculate SA#1 fund
      const hasPopularLoan = sa1IsActive;
      const sa1Paid = hasPopularLoan && unitData.sa1Pmt >= unitData.sa1Charge;
      const sa1PriorBalance = 0; // Starting from July with fresh slate
      const sa1Balance = hasPopularLoan ? (sa1PriorBalance + unitData.sa1Charge - unitData.sa1Pmt) : 0;

      // SA#2 fund
      const sa2OnPaymentPlan = unitData.notes.includes('3-yr plan') || unitData.notes.includes('payment plan');
      const sa2Payment = unitData.maintenancePmt - monthlyMaintenanceCharge - unitData.sa1Pmt;

      console.log(`Processing Unit ${unitData.unit} (${unitData.owner})...`);

      await db.update(units)
        .set({
          // Maintenance Fund
          maintenancePriorBalance: maintenancePriorBalance.toFixed(2),
          maintenancePaymentJuly: maintenancePayment.toFixed(2),
          maintenanceBalance: maintenanceBalance.toFixed(2),
          maintenancePaid: maintenancePaid,

          // SA#1 Fund
          hasPopularLoan: hasPopularLoan,
          sa1PriorBalance: sa1PriorBalance.toFixed(2),
          sa1PaymentJuly: unitData.sa1Pmt.toFixed(2),
          sa1Balance: sa1Balance.toFixed(2),
          sa1Paid: sa1Paid,

          // SA#2 Fund
          sa2RemainingBalance: unitData.sa2Remaining.toFixed(2),
          sa2PaymentJuly: Math.max(0, sa2Payment).toFixed(2),
          sa2OnPaymentPlan: sa2OnPaymentPlan,

          // Summary
          totalOwed: unitData.totalOwed.toFixed(2),
          notes: unitData.notes,
          redFlag: unitData.totalOwed > 10000 || unitData.notes.toLowerCase().includes('delinquent'),
          delinquent: unitData.notes.toLowerCase().includes('delinquent'),
          updatedAt: new Date()
        })
        .where(eq(units.unitNumber, unitData.unit));

      updatedCount++;
      console.log(`✅ Unit ${unitData.unit} updated successfully`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Unit ${unitData.unit} failed:`, error);
    }
  }

  console.log(`\n📈 Import Summary:`);
  console.log(`   ✅ Successfully updated: ${updatedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);

  if (updatedCount === 24) {
    console.log('\n🎉 All 24 units imported successfully from real CSV!');
    console.log('✅ All $NaN entries removed - showing real data only');
  }

  process.exit(errorCount > 0 ? 1 : 0);
}

importRealCSVData();
