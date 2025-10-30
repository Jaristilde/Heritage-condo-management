import { db } from '../server/db';
import { units } from '../shared/schema';
import { eq } from 'drizzle-orm';

const unitsData = [
  // Units that PAID SA#1 ($208) in July
  {
    unit: "202", owner: "Joane Aristilde",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 208.00, sa1_paid_july: true, sa1_status: "On-going",
    sa2_remaining_balance: 6856.07, sa2_status: "On-going", sa2_on_payment_plan: true,
    total_owed: 6856.07,
    red_flag: false, delinquent: false,
    notes: "SA #2 on 3-yr plan. Maintenance and SA#1 current."
  },
  {
    unit: "203", owner: "Gabrielle Fabre",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 208.00, sa1_paid_july: true, sa1_status: "On-going",
    sa2_remaining_balance: 6674.46, sa2_status: "On-going", sa2_on_payment_plan: true,
    total_owed: 6674.46,
    red_flag: false, delinquent: false,
    notes: "SA #2 on 3-yr plan. Maintenance and SA#1 current."
  },
  {
    unit: "205", owner: "Homeward Properties Inc",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 208.00, sa1_paid_july: true, sa1_status: "On-going",
    sa2_remaining_balance: 0, sa2_status: "Paid Off",
    total_owed: -1652.15,
    red_flag: false, delinquent: false,
    notes: "Has Maint. credit. SA#2 Paid Off."
  },
  {
    unit: "208", owner: "Homeward Properties Inc",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 208.00, sa1_paid_july: true, sa1_status: "On-going",
    sa2_remaining_balance: 0, sa2_status: "Paid Off",
    total_owed: -537.84,
    red_flag: false, delinquent: false,
    notes: "Has Maint. credit. Payment overage."
  },
  {
    unit: "301", owner: "Patricia Gnavi Gaiser",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 208.00, sa1_paid_july: true, sa1_status: "On-going",
    sa2_remaining_balance: 0, sa2_status: "On-going",
    total_owed: 6320.51,
    red_flag: false, delinquent: false,
    notes: "SA #2 bal (1 missed pmt) ID'd from deficit."
  },
  {
    unit: "303", owner: "Coronado II 1024, Inc.",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 208.00, sa1_paid_july: true, sa1_status: "On-going",
    sa2_remaining_balance: 0, sa2_status: "On-going",
    total_owed: 13277.75,
    red_flag: false, delinquent: false,
    notes: "SA #2 bal (3 missed pmts) ID'd from deficit."
  },

  // Units that DID NOT PAY SA#1 ($208) in July - RED FLAGS
  {
    unit: "204", owner: "Lorraine Epelbaum",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 208.00, sa1_paid_july: false, sa1_status: "On-going",
    sa2_remaining_balance: 11920.92, sa2_status: "On-going",
    total_owed: 18737.99,
    red_flag: true, delinquent: true,
    notes: "Delinquent all funds. Needs collection letter."
  },
  {
    unit: "305", owner: "Olivia Lopera",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 208.00, sa1_paid_july: false, sa1_status: "On-going",
    sa2_remaining_balance: 11920.92, sa2_status: "Delinquent",
    total_owed: 34122.00,
    red_flag: true, delinquent: true,
    notes: "SA #2 bal (10 missed pmts) ID'd from deficit."
  },
  {
    unit: "308", owner: "Michael Ham Est",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 208.00, sa1_paid_july: false, sa1_status: "On-going",
    sa2_remaining_balance: 11920.92, sa2_status: "Delinquent",
    total_owed: 61259.86,
    red_flag: true, delinquent: true,
    notes: "Deceased, delinquent since 2021."
  },
  {
    unit: "401", owner: "Jose Rodriguez",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 208.00, sa1_paid_july: false, sa1_status: "On-going",
    sa2_remaining_balance: 5173.88, sa2_status: "Delinquent",
    total_owed: 5382.28,
    red_flag: true, delinquent: false,
    notes: "Needs payment plan for SA#2 and pay SA#1."
  },
  {
    unit: "402", owner: "Adela Somodevilla Est",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 208.00, sa1_paid_july: false, sa1_status: "On-going",
    sa2_remaining_balance: 11920.92, sa2_status: "Delinquent",
    total_owed: 2989.12,
    red_flag: true, delinquent: false,
    notes: "SA #2 bal (1 missed pmt) ID'd from deficit."
  },
  {
    unit: "405", owner: "Cordell Davis",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 208.00, sa1_paid_july: false, sa1_status: "On-going",
    sa2_remaining_balance: 11920.92, sa2_status: "Delinquent",
    total_owed: 35837.47,
    red_flag: true, delinquent: true,
    notes: "SA #2 bal (all missed pmts) ID'd from deficit."
  },

  // Units with SA#1 PAID OFF (no $208 charge)
  {
    unit: "201", owner: "Jose Peirats",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 0, sa1_status: "Paid Off",
    sa2_remaining_balance: 0, sa2_status: "Paid Off",
    total_owed: -505.27,
    red_flag: false, delinquent: false,
    notes: "Has Maint. credit. SA #1 & SA #2 Paid Off."
  },
  {
    unit: "206", owner: "Ramon Ortega",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 0, sa1_status: "Paid Off",
    sa2_remaining_balance: 11920.92, sa2_status: "Paid Off",
    total_owed: 11592.59,
    red_flag: false, delinquent: false,
    notes: "SA #1 Paid Off. SA #2 status unknown, needs investigation."
  },
  {
    unit: "207", owner: "JiFood Group LLC",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 0, sa1_status: "Paid Off",
    sa2_remaining_balance: 7007.59, sa2_status: "Paid Off",
    total_owed: 5272.24,
    red_flag: false, delinquent: false,
    notes: "SA #1 Paid Off. Payment overage."
  },
  {
    unit: "302", owner: "Cally Vann Lievano",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 0, sa1_status: "Paid Off",
    sa2_remaining_balance: 0, sa2_status: "Paid Off",
    total_owed: 11781.01,
    red_flag: false, delinquent: false,
    notes: "SA #1 Paid Off. SA #2 bal (5 missed pmts)."
  },
  {
    unit: "304", owner: "Gralpe LLC",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 0, sa1_status: "Paid Off",
    sa2_remaining_balance: 3120.31, sa2_status: "On-going",
    total_owed: 3120.31,
    red_flag: false, delinquent: false,
    notes: "SA #1 Paid Off. Report shows credit balance."
  },
  {
    unit: "306", owner: "Ramon Ortega",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 0, sa1_status: "Paid Off",
    sa2_remaining_balance: 0, sa2_status: "Paid Off",
    total_owed: 15970.07,
    red_flag: false, delinquent: false,
    notes: "SA #1 Paid Off. SA #2 bal (all missed pmts). Usually paid for the year, needs investigation."
  },
  {
    unit: "307", owner: "Gierre USA Corp",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 0, sa1_status: "Paid Off",
    sa2_remaining_balance: 0, sa2_status: "Paid Off",
    total_owed: 7.68,
    red_flag: false, delinquent: false,
    notes: "SA #1 Paid Off. SA #2 status unknown."
  },
  {
    unit: "403", owner: "Federico Hurtado",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 0, sa1_status: "Paid Off",
    sa2_remaining_balance: 0, sa2_status: "Paid Off",
    total_owed: -50.00,
    red_flag: false, delinquent: false,
    notes: "SA #1 Paid Off. Has Maint. credit."
  },
  {
    unit: "404", owner: "Gralpe LLC",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 0, sa1_status: "Paid Off",
    sa2_remaining_balance: 2190.00, sa2_status: "Paid Off",
    total_owed: 2190.75,
    red_flag: false, delinquent: false,
    notes: "SA #1 Paid Off. Report shows credit balance."
  },
  {
    unit: "406", owner: "Catalina Vargas Peirats",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 0, sa1_status: "Paid Off",
    sa2_remaining_balance: 2190.75, sa2_status: "Paid Off",
    total_owed: 550.68,
    red_flag: false, delinquent: false,
    notes: "SA #1 Paid Off. SA #2 status unknown."
  },
  {
    unit: "407", owner: "Brian Morrison",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 0, sa1_status: "Paid Off",
    sa2_remaining_balance: 0, sa2_status: "Paid Off",
    total_owed: -636.77,
    red_flag: false, delinquent: false,
    notes: "SA #1 Paid Off. Has Maint. credit."
  },
  {
    unit: "408", owner: "Sara Leviten",
    monthly_maintenance: 578.45,
    sa1_monthly_charge: 0, sa1_status: "Paid Off",
    sa2_remaining_balance: 0, sa2_status: "Paid Off",
    total_owed: 2963.34,
    red_flag: false, delinquent: false,
    notes: "SA #1 & SA#2 Paid Off. Deficit on Monthly Maintenance."
  }
];

async function importAllUnitsData() {
  console.log('📊 Starting data import for all 24 units...\n');

  let updatedCount = 0;
  let errorCount = 0;

  for (const unitData of unitsData) {
    try {
      const totalMonthlyDue = unitData.monthly_maintenance + unitData.sa1_monthly_charge;

      await db.update(units)
        .set({
          monthlyMaintenance: unitData.monthly_maintenance.toFixed(2),
          sa1_monthlyCharge: unitData.sa1_monthly_charge.toFixed(2),
          sa1PaidJuly: unitData.sa1_paid_july,
          sa1Status: unitData.sa1_status,
          sa2RemainingBalance: unitData.sa2_remaining_balance.toFixed(2),
          sa2Status: unitData.sa2_status,
          sa2OnPaymentPlan: unitData.sa2_on_payment_plan,
          totalOwed: unitData.total_owed.toFixed(2),
          totalMonthlyDue: totalMonthlyDue.toFixed(2),
          redFlag: unitData.red_flag,
          delinquent: unitData.delinquent,
          notes: unitData.notes,
          updatedAt: new Date()
        })
        .where(eq(units.unitNumber, unitData.unit));

      updatedCount++;
      console.log(`✅ Unit ${unitData.unit} (${unitData.owner})`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Unit ${unitData.unit} failed:`, error);
    }
  }

  console.log(`\n📈 Import Summary:`);
  console.log(`   Total units processed: ${unitsData.length}`);
  console.log(`   ✅ Successfully updated: ${updatedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);

  if (updatedCount === unitsData.length) {
    console.log('\n🎉 All units imported successfully!');
  }

  process.exit(errorCount > 0 ? 1 : 0);
}

importAllUnitsData();
