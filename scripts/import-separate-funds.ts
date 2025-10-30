import { db } from '../server/db';
import { units } from '../shared/schema';
import { eq } from 'drizzle-orm';

// COMPREHENSIVE FUND ALLOCATION DATA - ALL 24 UNITS
const unitsFinancialData = [
  // ═══════════════════════════════════════════════════════════
  // UNITS THAT PAID SA#1 ($208) IN JULY - CURRENT
  // ═══════════════════════════════════════════════════════════
  {
    unit: "202",
    // Maintenance Fund
    maintenance_prior_balance: 0,
    maintenance_payment_july: 578.45,
    maintenance_balance: 0,
    maintenance_paid: true,
    // SA#1 Fund
    has_popular_loan: true,
    sa1_prior_balance: 0,
    sa1_payment_july: 208.00,
    sa1_balance: 0,
    sa1_paid: true,
    // SA#2 Fund
    sa2_remaining_balance: 6856.07,
    sa2_payment_july: 0,
    sa2_on_payment_plan: true,
    // Total
    total_owed: 6856.07,
    notes: "✅ Maintenance & SA#1 PAID. SA#2 on 3-yr plan."
  },
  {
    unit: "203",
    maintenance_prior_balance: 0,
    maintenance_payment_july: 578.45,
    maintenance_balance: 0,
    maintenance_paid: true,
    has_popular_loan: true,
    sa1_prior_balance: 0,
    sa1_payment_july: 208.00,
    sa1_balance: 0,
    sa1_paid: true,
    sa2_remaining_balance: 6674.46,
    sa2_payment_july: 0,
    sa2_on_payment_plan: true,
    total_owed: 6674.46,
    notes: "✅ Maintenance & SA#1 PAID. SA#2 on 3-yr plan."
  },
  {
    unit: "205",
    maintenance_prior_balance: 0,
    maintenance_payment_july: 578.45,
    maintenance_balance: 0,
    maintenance_paid: true,
    has_popular_loan: true,
    sa1_prior_balance: 0,
    sa1_payment_july: 208.00,
    sa1_balance: 0,
    sa1_paid: true,
    sa2_remaining_balance: 0,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: -1652.15,
    notes: "✅ All PAID. Has maintenance credit."
  },
  {
    unit: "208",
    maintenance_prior_balance: 0,
    maintenance_payment_july: 578.45,
    maintenance_balance: 0,
    maintenance_paid: true,
    has_popular_loan: true,
    sa1_prior_balance: 0,
    sa1_payment_july: 208.00,
    sa1_balance: 0,
    sa1_paid: true,
    sa2_remaining_balance: 0,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: -537.84,
    notes: "✅ All PAID. Payment overage."
  },
  {
    unit: "301",
    maintenance_prior_balance: 0,
    maintenance_payment_july: 578.45,
    maintenance_balance: 0,
    maintenance_paid: true,
    has_popular_loan: true,
    sa1_prior_balance: 0,
    sa1_payment_july: 208.00,
    sa1_balance: 0,
    sa1_paid: true,
    sa2_remaining_balance: 6320.51,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: 6320.51,
    notes: "✅ Maintenance & SA#1 PAID. SA#2 owes 1 payment."
  },
  {
    unit: "303",
    maintenance_prior_balance: 0,
    maintenance_payment_july: 578.45,
    maintenance_balance: 0,
    maintenance_paid: true,
    has_popular_loan: true,
    sa1_prior_balance: 0,
    sa1_payment_july: 208.00,
    sa1_balance: 0,
    sa1_paid: true,
    sa2_remaining_balance: 13277.75,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: 13277.75,
    notes: "✅ Maintenance & SA#1 PAID. SA#2 owes 3 payments."
  },

  // ═══════════════════════════════════════════════════════════
  // UNITS THAT DID NOT PAY SA#1 ($208) IN JULY - RED FLAGS
  // ═══════════════════════════════════════════════════════════
  {
    unit: "204",
    maintenance_prior_balance: 5489.62,
    maintenance_payment_july: 0,
    maintenance_balance: 6068.07, // prior + $578.45
    maintenance_paid: false,
    has_popular_loan: true,
    sa1_prior_balance: 0,
    sa1_payment_july: 0,
    sa1_balance: 208.00,
    sa1_paid: false,
    sa2_remaining_balance: 11920.92,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: 18737.99, // includes late fees
    notes: "🚩 DELINQUENT. Needs collection letter."
  },
  {
    unit: "305",
    maintenance_prior_balance: 10280.16,
    maintenance_payment_july: 0,
    maintenance_balance: 10858.61,
    maintenance_paid: false,
    has_popular_loan: true,
    sa1_prior_balance: 0,
    sa1_payment_july: 0,
    sa1_balance: 208.00,
    sa1_paid: false,
    sa2_remaining_balance: 11920.92,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: 34122.00,
    notes: "🚩 DELINQUENT. SA#2 owes 10 payments."
  },
  {
    unit: "308",
    maintenance_prior_balance: 37198.02,
    maintenance_payment_july: 0,
    maintenance_balance: 37776.47,
    maintenance_paid: false,
    has_popular_loan: true,
    sa1_prior_balance: 0,
    sa1_payment_july: 0,
    sa1_balance: 208.00,
    sa1_paid: false,
    sa2_remaining_balance: 11920.92,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: 61259.86,
    notes: "🚩 DECEASED. Delinquent since 2021. Foreclosure."
  },
  {
    unit: "401",
    maintenance_prior_balance: 0,
    maintenance_payment_july: 578.05,
    maintenance_balance: 0.40, // paid $578.05, charge is $578.45
    maintenance_paid: false,
    has_popular_loan: true,
    sa1_prior_balance: 0,
    sa1_payment_july: 0,
    sa1_balance: 208.00,
    sa1_paid: false,
    sa2_remaining_balance: 5173.88,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: 5382.28,
    notes: "🚩 Partial maintenance payment. Needs SA#1 & SA#2 plan."
  },
  {
    unit: "402",
    maintenance_prior_balance: 0,
    maintenance_payment_july: 578.45,
    maintenance_balance: 0,
    maintenance_paid: true,
    has_popular_loan: true,
    sa1_prior_balance: 0,
    sa1_payment_july: 0,
    sa1_balance: 208.00,
    sa1_paid: false,
    sa2_remaining_balance: 11920.92,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: 2989.12, // includes other adjustments
    notes: "🚩 Paid maintenance only. Missing SA#1."
  },
  {
    unit: "405",
    maintenance_prior_balance: 11995.63,
    maintenance_payment_july: 0,
    maintenance_balance: 12574.08,
    maintenance_paid: false,
    has_popular_loan: true,
    sa1_prior_balance: 0,
    sa1_payment_july: 0,
    sa1_balance: 208.00,
    sa1_paid: false,
    sa2_remaining_balance: 11920.92,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: 35837.47,
    notes: "🚩 DELINQUENT. SA#2 never paid."
  },

  // ═══════════════════════════════════════════════════════════
  // UNITS WITH SA#1 PAID OFF (No Popular Loan)
  // ═══════════════════════════════════════════════════════════
  {
    unit: "201",
    maintenance_prior_balance: 0,
    maintenance_payment_july: 578.45,
    maintenance_balance: 0,
    maintenance_paid: true,
    has_popular_loan: false,
    sa1_prior_balance: 0,
    sa1_payment_july: 0,
    sa1_balance: 0,
    sa1_paid: true,
    sa2_remaining_balance: 0,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: -505.27,
    notes: "✅ ALL PAID. SA#1 & SA#2 paid off. Has credit."
  },
  {
    unit: "206",
    maintenance_prior_balance: 0,
    maintenance_payment_july: 578.45,
    maintenance_balance: 0,
    maintenance_paid: true,
    has_popular_loan: false,
    sa1_prior_balance: 0,
    sa1_payment_july: 0,
    sa1_balance: 0,
    sa1_paid: true,
    sa2_remaining_balance: 11920.92,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: 11592.59,
    notes: "SA#1 paid off. SA#2 status unclear, needs investigation."
  },
  {
    unit: "207",
    maintenance_prior_balance: 0,
    maintenance_payment_july: 578.45,
    maintenance_balance: 0,
    maintenance_paid: true,
    has_popular_loan: false,
    sa1_prior_balance: 0,
    sa1_payment_july: 0,
    sa1_balance: 0,
    sa1_paid: true,
    sa2_remaining_balance: 7007.59,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: 5272.24,
    notes: "SA#1 paid off. Payment overage."
  },
  {
    unit: "302",
    maintenance_prior_balance: 0,
    maintenance_payment_july: 578.45,
    maintenance_balance: 0,
    maintenance_paid: true,
    has_popular_loan: false,
    sa1_prior_balance: 0,
    sa1_payment_july: 0,
    sa1_balance: 0,
    sa1_paid: true,
    sa2_remaining_balance: 11920.92,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: 11781.01,
    notes: "SA#1 paid off. SA#2 owes 5 payments."
  },
  {
    unit: "304",
    maintenance_prior_balance: 0,
    maintenance_payment_july: 578.45,
    maintenance_balance: 0,
    maintenance_paid: true,
    has_popular_loan: false,
    sa1_prior_balance: 0,
    sa1_payment_july: 0,
    sa1_balance: 0,
    sa1_paid: true,
    sa2_remaining_balance: 3120.31,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: 3120.31,
    notes: "SA#1 paid off. Credit balance on report."
  },
  {
    unit: "306",
    maintenance_prior_balance: 0,
    maintenance_payment_july: 0,
    maintenance_balance: 578.45,
    maintenance_paid: false,
    has_popular_loan: false,
    sa1_prior_balance: 0,
    sa1_payment_july: 0,
    sa1_balance: 0,
    sa1_paid: true,
    sa2_remaining_balance: 11920.92,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: 15970.07,
    notes: "SA#1 paid off. Usually pays annually, investigation needed."
  },
  {
    unit: "307",
    maintenance_prior_balance: 0,
    maintenance_payment_july: 578.45,
    maintenance_balance: 0,
    maintenance_paid: true,
    has_popular_loan: false,
    sa1_prior_balance: 0,
    sa1_payment_july: 0,
    sa1_balance: 0,
    sa1_paid: true,
    sa2_remaining_balance: 0,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: 7.68,
    notes: "SA#1 paid off. Minor outstanding balance."
  },
  {
    unit: "403",
    maintenance_prior_balance: 0,
    maintenance_payment_july: 578.45,
    maintenance_balance: 0,
    maintenance_paid: true,
    has_popular_loan: false,
    sa1_prior_balance: 0,
    sa1_payment_july: 0,
    sa1_balance: 0,
    sa1_paid: true,
    sa2_remaining_balance: 0,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: -50.00,
    notes: "✅ ALL PAID. Has credit."
  },
  {
    unit: "404",
    maintenance_prior_balance: 0,
    maintenance_payment_july: 578.45,
    maintenance_balance: 0,
    maintenance_paid: true,
    has_popular_loan: false,
    sa1_prior_balance: 0,
    sa1_payment_july: 0,
    sa1_balance: 0,
    sa1_paid: true,
    sa2_remaining_balance: 2190.00,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: 2190.75,
    notes: "SA#1 paid off. Credit balance."
  },
  {
    unit: "406",
    maintenance_prior_balance: 0,
    maintenance_payment_july: 578.45,
    maintenance_balance: 0,
    maintenance_paid: true,
    has_popular_loan: false,
    sa1_prior_balance: 0,
    sa1_payment_july: 0,
    sa1_balance: 0,
    sa1_paid: true,
    sa2_remaining_balance: 2190.75,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: 550.68,
    notes: "SA#1 paid off."
  },
  {
    unit: "407",
    maintenance_prior_balance: 0,
    maintenance_payment_july: 578.45,
    maintenance_balance: 0,
    maintenance_paid: true,
    has_popular_loan: false,
    sa1_prior_balance: 0,
    sa1_payment_july: 0,
    sa1_balance: 0,
    sa1_paid: true,
    sa2_remaining_balance: 0,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: -636.77,
    notes: "✅ ALL PAID. Has credit."
  },
  {
    unit: "408",
    maintenance_prior_balance: 0,
    maintenance_payment_july: 578.45,
    maintenance_balance: 0,
    maintenance_paid: true,
    has_popular_loan: false,
    sa1_prior_balance: 0,
    sa1_payment_july: 0,
    sa1_balance: 0,
    sa1_paid: true,
    sa2_remaining_balance: 0,
    sa2_payment_july: 0,
    sa2_on_payment_plan: false,
    total_owed: 2963.34,
    notes: "SA#1 & SA#2 paid off. Deficit on maintenance."
  },
];

async function importSeparateFunds() {
  console.log('🚨 EMERGENCY: Importing separate fund allocations for all 24 units...\n');

  let updatedCount = 0;
  let errorCount = 0;

  for (const unitData of unitsFinancialData) {
    try {
      await db.update(units)
        .set({
          // Maintenance Fund
          maintenancePriorBalance: unitData.maintenance_prior_balance.toFixed(2),
          maintenancePaymentJuly: unitData.maintenance_payment_july.toFixed(2),
          maintenanceBalance: unitData.maintenance_balance.toFixed(2),
          maintenancePaid: unitData.maintenance_paid,

          // SA#1 Fund
          hasPopularLoan: unitData.has_popular_loan,
          sa1PriorBalance: unitData.sa1_prior_balance.toFixed(2),
          sa1PaymentJuly: unitData.sa1_payment_july.toFixed(2),
          sa1Balance: unitData.sa1_balance.toFixed(2),
          sa1Paid: unitData.sa1_paid,

          // SA#2 Fund
          sa2RemainingBalance: unitData.sa2_remaining_balance.toFixed(2),
          sa2PaymentJuly: unitData.sa2_payment_july.toFixed(2),
          sa2OnPaymentPlan: unitData.sa2_on_payment_plan,

          // Total & Notes
          totalOwed: unitData.total_owed.toFixed(2),
          notes: unitData.notes,
          updatedAt: new Date()
        })
        .where(eq(units.unitNumber, unitData.unit));

      updatedCount++;

      const statusIcon = unitData.maintenance_paid && unitData.sa1_paid ? '✅' : '🚩';
      console.log(`${statusIcon} Unit ${unitData.unit} - Maint: $${unitData.maintenance_balance.toFixed(2)}, SA#1: $${unitData.sa1_balance.toFixed(2)}, SA#2: $${unitData.sa2_remaining_balance.toFixed(2)}`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Unit ${unitData.unit} failed:`, error);
    }
  }

  console.log(`\n📈 Import Summary:`);
  console.log(`   Total units processed: ${unitsFinancialData.length}`);
  console.log(`   ✅ Successfully updated: ${updatedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);

  if (updatedCount === unitsFinancialData.length) {
    console.log('\n🎉 ALL 24 UNITS NOW HAVE SEPARATE FUND TRACKING!');
    console.log('💳 Each unit now shows:');
    console.log('   - Maintenance fund balance');
    console.log('   - SA#1 Popular Loan balance');
    console.log('   - SA#2 (2024 Assessment) balance');
  }

  process.exit(errorCount > 0 ? 1 : 0);
}

importSeparateFunds();
