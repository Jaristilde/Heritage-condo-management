import { config } from "dotenv";
config(); // Load .env file

import { db } from "../server/db";
import { units } from "../shared/schema";
import { eq } from "drizzle-orm";

/**
 * POPULATE 2024 SPECIAL ASSESSMENT DATA
 *
 * This script updates all 24 units with accurate 2024 Assessment tracking:
 * - Clear "PAID IN FULL", "3-YEAR PLAN", "PARTIAL", or "UNPAID" status
 * - Detailed payment history
 * - Monthly payment breakdown
 * - Payment plan progress for Units 202 & 203
 *
 * CRITICAL: This data is for board visibility and legal compliance
 */

interface Assessment2024Data {
  unitNumber: string;
  ownerName: string;

  // Monthly charges
  monthlyMaintenance: string;
  monthlyPopularLoan: string;
  monthlyAssessmentPlan: string;

  // Current balances
  maintenanceBalance: string;
  popularLoanBalance: string;
  creditBalance: string;
  totalOwed: string;

  // 2024 Assessment tracking
  assessment2024Original: string;
  assessment2024Paid: string;
  assessment2024Remaining: string;
  assessment2024Status: "PAID IN FULL" | "3-YEAR PLAN" | "PARTIAL" | "UNPAID";

  // Payment plan (if applicable)
  onAssessmentPlan: boolean;
  assessmentPlanStartDate?: string;
  assessmentPlanEndDate?: string;
  assessmentPlanMonthly?: string;
  assessmentPlanMonthsTotal?: number;
  assessmentPlanMonthsCompleted?: number;

  // Status flags
  delinquencyStatus: string;
  priorityLevel: string;
  redFlag: boolean;
  withAttorney: boolean;
  inForeclosure: boolean;
  legalNotes?: string;
}

const assessment2024Data: Assessment2024Data[] = [
  // ===== FLOOR 2 =====
  {
    unitNumber: "201",
    ownerName: "Jose Peirats",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "0",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "0",
    popularLoanBalance: "0",
    creditBalance: "-505.27",
    totalOwed: "-505.27",
    assessment2024Original: "11920.92",
    assessment2024Paid: "11920.92",
    assessment2024Remaining: "0",
    assessment2024Status: "PAID IN FULL",
    onAssessmentPlan: false,
    delinquencyStatus: "current",
    priorityLevel: "low",
    redFlag: false,
    withAttorney: false,
    inForeclosure: false,
    legalNotes: "2024 assessment paid in full. Has credit balance of $505.27."
  },
  {
    unitNumber: "202",
    ownerName: "Joane Aristilde",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "208.00",
    monthlyAssessmentPlan: "305.56",
    maintenanceBalance: "0",
    popularLoanBalance: "0",
    creditBalance: "0",
    totalOwed: "6856.07",
    assessment2024Original: "11920.92",
    assessment2024Paid: "5064.85",
    assessment2024Remaining: "6856.07",
    assessment2024Status: "3-YEAR PLAN",
    onAssessmentPlan: true,
    assessmentPlanStartDate: "2024-04-01",
    assessmentPlanEndDate: "2027-03-31",
    assessmentPlanMonthly: "305.56",
    assessmentPlanMonthsTotal: 36,
    assessmentPlanMonthsCompleted: 16,
    delinquencyStatus: "current",
    priorityLevel: "low",
    redFlag: false,
    withAttorney: false,
    inForeclosure: false,
    legalNotes: "Voluntary 3-year payment plan for 2024 assessment. All payments current."
  },
  {
    unitNumber: "203",
    ownerName: "Gabrielle Fabre",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "208.00",
    monthlyAssessmentPlan: "305.56",
    maintenanceBalance: "0",
    popularLoanBalance: "0",
    creditBalance: "0",
    totalOwed: "6674.46",
    assessment2024Original: "11920.92",
    assessment2024Paid: "5246.46",
    assessment2024Remaining: "6674.46",
    assessment2024Status: "3-YEAR PLAN",
    onAssessmentPlan: true,
    assessmentPlanStartDate: "2024-04-01",
    assessmentPlanEndDate: "2027-03-31",
    assessmentPlanMonthly: "305.56",
    assessmentPlanMonthsTotal: 36,
    assessmentPlanMonthsCompleted: 16,
    delinquencyStatus: "current",
    priorityLevel: "low",
    redFlag: false,
    withAttorney: false,
    inForeclosure: false,
    legalNotes: "Voluntary 3-year payment plan for 2024 assessment. All payments current."
  },
  {
    unitNumber: "204",
    ownerName: "Lorraine Epelbaum",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "208.00",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "5489.62",
    popularLoanBalance: "416.00",
    creditBalance: "0",
    totalOwed: "18737.99",
    assessment2024Original: "11920.92",
    assessment2024Paid: "0",
    assessment2024Remaining: "12832.37",
    assessment2024Status: "UNPAID",
    onAssessmentPlan: false,
    delinquencyStatus: "90plus",
    priorityLevel: "critical",
    redFlag: true,
    withAttorney: false,
    inForeclosure: false,
    legalNotes: "2024 assessment unpaid. Accruing penalties and interest."
  },
  {
    unitNumber: "205",
    ownerName: "Homeward Properties Inc",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "208.00",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "0",
    popularLoanBalance: "0",
    creditBalance: "-1652.15",
    totalOwed: "-1652.15",
    assessment2024Original: "11920.92",
    assessment2024Paid: "11920.92",
    assessment2024Remaining: "0",
    assessment2024Status: "PAID IN FULL",
    onAssessmentPlan: false,
    delinquencyStatus: "current",
    priorityLevel: "low",
    redFlag: false,
    withAttorney: false,
    inForeclosure: false,
    legalNotes: "2024 assessment paid in full. Has credit balance."
  },
  {
    unitNumber: "206",
    ownerName: "Ramon Ortega",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "0",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "4625.59",
    popularLoanBalance: "0",
    creditBalance: "0",
    totalOwed: "11592.59",
    assessment2024Original: "11920.92",
    assessment2024Paid: "4953.92",
    assessment2024Remaining: "6967.00",
    assessment2024Status: "PARTIAL",
    onAssessmentPlan: false,
    delinquencyStatus: "90plus",
    priorityLevel: "critical",
    redFlag: true,
    withAttorney: false,
    inForeclosure: false,
    legalNotes: "Partial payment on 2024 assessment. Delinquent on maintenance."
  },
  {
    unitNumber: "207",
    ownerName: "JiFood Group LLC",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "0",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "0",
    popularLoanBalance: "0",
    creditBalance: "0",
    totalOwed: "5272.24",
    assessment2024Original: "11920.92",
    assessment2024Paid: "6648.68",
    assessment2024Remaining: "5272.24",
    assessment2024Status: "PARTIAL",
    onAssessmentPlan: false,
    delinquencyStatus: "current",
    priorityLevel: "medium",
    redFlag: false,
    withAttorney: false,
    inForeclosure: false,
    legalNotes: "Making partial payments on 2024 assessment."
  },
  {
    unitNumber: "208",
    ownerName: "Homeward Properties Inc",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "208.00",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "0",
    popularLoanBalance: "0",
    creditBalance: "-537.84",
    totalOwed: "-537.84",
    assessment2024Original: "11920.92",
    assessment2024Paid: "11920.92",
    assessment2024Remaining: "0",
    assessment2024Status: "PAID IN FULL",
    onAssessmentPlan: false,
    delinquencyStatus: "current",
    priorityLevel: "low",
    redFlag: false,
    withAttorney: false,
    inForeclosure: false,
    legalNotes: "2024 assessment paid in full. Has credit balance."
  },

  // ===== FLOOR 3 =====
  {
    unitNumber: "301",
    ownerName: "Patricia Gnavi Gaiser",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "208.00",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "0",
    popularLoanBalance: "0",
    creditBalance: "0",
    totalOwed: "6320.51",
    assessment2024Original: "11920.92",
    assessment2024Paid: "5600.41",
    assessment2024Remaining: "6320.51",
    assessment2024Status: "PARTIAL",
    onAssessmentPlan: false,
    delinquencyStatus: "current",
    priorityLevel: "medium",
    redFlag: false,
    withAttorney: false,
    inForeclosure: false,
    legalNotes: "Making partial payments on 2024 assessment."
  },
  {
    unitNumber: "302",
    ownerName: "Cally Vann Lievano",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "0",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "4625.59",
    popularLoanBalance: "0",
    creditBalance: "0",
    totalOwed: "11781.01",
    assessment2024Original: "11920.92",
    assessment2024Paid: "4764.50",
    assessment2024Remaining: "7155.42",
    assessment2024Status: "PARTIAL",
    onAssessmentPlan: false,
    delinquencyStatus: "90plus",
    priorityLevel: "critical",
    redFlag: true,
    withAttorney: false,
    inForeclosure: false,
    legalNotes: "Partial payment on 2024 assessment. Delinquent on maintenance."
  },
  {
    unitNumber: "303",
    ownerName: "Coronado II 1024, Inc.",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "208.00",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "0",
    popularLoanBalance: "0",
    creditBalance: "0",
    totalOwed: "13277.75",
    assessment2024Original: "11920.92",
    assessment2024Paid: "0",
    assessment2024Remaining: "11920.92",
    assessment2024Status: "UNPAID",
    onAssessmentPlan: false,
    delinquencyStatus: "current",
    priorityLevel: "medium",
    redFlag: false,
    withAttorney: false,
    inForeclosure: false,
    legalNotes: "2024 assessment unpaid. Current on maintenance."
  },
  {
    unitNumber: "304",
    ownerName: "Gralpe LLC",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "0",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "0",
    popularLoanBalance: "0",
    creditBalance: "0",
    totalOwed: "3120.31",
    assessment2024Original: "11920.92",
    assessment2024Paid: "8800.61",
    assessment2024Remaining: "3120.31",
    assessment2024Status: "PARTIAL",
    onAssessmentPlan: false,
    delinquencyStatus: "current",
    priorityLevel: "low",
    redFlag: false,
    withAttorney: false,
    inForeclosure: false,
    legalNotes: "Making partial payments on 2024 assessment. Current on maintenance."
  },
  {
    unitNumber: "305",
    ownerName: "Olivia Lopera",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "208.00",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "15398.03",
    popularLoanBalance: "208.00",
    creditBalance: "0",
    totalOwed: "34122.00",
    assessment2024Original: "11920.92",
    assessment2024Paid: "0",
    assessment2024Remaining: "18515.97",
    assessment2024Status: "UNPAID",
    onAssessmentPlan: false,
    delinquencyStatus: "attorney",
    priorityLevel: "attorney",
    redFlag: true,
    withAttorney: true,
    inForeclosure: false,
    legalNotes: "WITH ATTORNEY. Never paid 2024 assessment. Significant arrears on all charges."
  },
  {
    unitNumber: "306",
    ownerName: "Ramon Ortega",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "0",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "9003.07",
    popularLoanBalance: "0",
    creditBalance: "0",
    totalOwed: "15970.07",
    assessment2024Original: "11920.92",
    assessment2024Paid: "4953.92",
    assessment2024Remaining: "6967.00",
    assessment2024Status: "PARTIAL",
    onAssessmentPlan: false,
    delinquencyStatus: "attorney",
    priorityLevel: "attorney",
    redFlag: true,
    withAttorney: true,
    inForeclosure: false,
    legalNotes: "WITH ATTORNEY. Partial payment on 2024 assessment. Significant maintenance arrears."
  },
  {
    unitNumber: "307",
    ownerName: "Gierre USA Corp",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "0",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "0",
    popularLoanBalance: "0",
    creditBalance: "0",
    totalOwed: "7.68",
    assessment2024Original: "11920.92",
    assessment2024Paid: "11913.24",
    assessment2024Remaining: "7.68",
    assessment2024Status: "PAID IN FULL",
    onAssessmentPlan: false,
    delinquencyStatus: "current",
    priorityLevel: "low",
    redFlag: false,
    withAttorney: false,
    inForeclosure: false,
    legalNotes: "2024 assessment effectively paid (remaining $7.68 is negligible)."
  },
  {
    unitNumber: "308",
    ownerName: "Michael Ham Est",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "208.00",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "23292.55",
    popularLoanBalance: "624.00",
    creditBalance: "0",
    totalOwed: "61259.86",
    assessment2024Original: "11920.92",
    assessment2024Paid: "0",
    assessment2024Remaining: "37343.31",
    assessment2024Status: "UNPAID",
    onAssessmentPlan: false,
    delinquencyStatus: "attorney",
    priorityLevel: "attorney",
    redFlag: true,
    withAttorney: true,
    inForeclosure: true,
    legalNotes: "FORECLOSURE. Owner deceased 2021. Never paid 2024 assessment. Total debt $61,259.86."
  },

  // ===== FLOOR 4 =====
  {
    unitNumber: "401",
    ownerName: "Jose Rodriguez",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "208.00",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "0",
    popularLoanBalance: "0",
    creditBalance: "0",
    totalOwed: "5382.28",
    assessment2024Original: "11920.92",
    assessment2024Paid: "6538.64",
    assessment2024Remaining: "5382.28",
    assessment2024Status: "PARTIAL",
    onAssessmentPlan: false,
    delinquencyStatus: "current",
    priorityLevel: "medium",
    redFlag: false,
    withAttorney: false,
    inForeclosure: false,
    legalNotes: "Making partial payments on 2024 assessment. Current on maintenance."
  },
  {
    unitNumber: "402",
    ownerName: "Adela Somodevilla Est",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "208.00",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "0",
    popularLoanBalance: "0",
    creditBalance: "0",
    totalOwed: "2989.12",
    assessment2024Original: "11920.92",
    assessment2024Paid: "8931.80",
    assessment2024Remaining: "2989.12",
    assessment2024Status: "PARTIAL",
    onAssessmentPlan: false,
    delinquencyStatus: "current",
    priorityLevel: "low",
    redFlag: false,
    withAttorney: false,
    inForeclosure: false,
    legalNotes: "Making good progress on 2024 assessment. Current on all other charges."
  },
  {
    unitNumber: "403",
    ownerName: "Federico Hurtado",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "0",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "0",
    popularLoanBalance: "0",
    creditBalance: "-50.00",
    totalOwed: "-50.00",
    assessment2024Original: "11920.92",
    assessment2024Paid: "11920.92",
    assessment2024Remaining: "0",
    assessment2024Status: "PAID IN FULL",
    onAssessmentPlan: false,
    delinquencyStatus: "current",
    priorityLevel: "low",
    redFlag: false,
    withAttorney: false,
    inForeclosure: false,
    legalNotes: "2024 assessment paid in full. Has small credit balance."
  },
  {
    unitNumber: "404",
    ownerName: "Gralpe LLC",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "0",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "0",
    popularLoanBalance: "0",
    creditBalance: "0",
    totalOwed: "2190.75",
    assessment2024Original: "11920.92",
    assessment2024Paid: "9730.17",
    assessment2024Remaining: "2190.75",
    assessment2024Status: "PARTIAL",
    onAssessmentPlan: false,
    delinquencyStatus: "current",
    priorityLevel: "low",
    redFlag: false,
    withAttorney: false,
    inForeclosure: false,
    legalNotes: "Almost finished paying 2024 assessment. Current on maintenance."
  },
  {
    unitNumber: "405",
    ownerName: "Cordell Davis",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "208.00",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "23292.55",
    popularLoanBalance: "624.00",
    creditBalance: "0",
    totalOwed: "35837.47",
    assessment2024Original: "11920.92",
    assessment2024Paid: "0",
    assessment2024Remaining: "11920.92",
    assessment2024Status: "UNPAID",
    onAssessmentPlan: false,
    delinquencyStatus: "attorney",
    priorityLevel: "attorney",
    redFlag: true,
    withAttorney: true,
    inForeclosure: false,
    legalNotes: "WITH ATTORNEY. Never paid 2024 assessment. Significant arrears on all charges."
  },
  {
    unitNumber: "406",
    ownerName: "Catalina Vargas Peirats",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "0",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "0",
    popularLoanBalance: "0",
    creditBalance: "0",
    totalOwed: "550.68",
    assessment2024Original: "11920.92",
    assessment2024Paid: "11370.24",
    assessment2024Remaining: "550.68",
    assessment2024Status: "PARTIAL",
    onAssessmentPlan: false,
    delinquencyStatus: "current",
    priorityLevel: "low",
    redFlag: false,
    withAttorney: false,
    inForeclosure: false,
    legalNotes: "Almost finished paying 2024 assessment. Current on maintenance."
  },
  {
    unitNumber: "407",
    ownerName: "Brian Morrison",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "0",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "0",
    popularLoanBalance: "0",
    creditBalance: "-636.77",
    totalOwed: "-636.77",
    assessment2024Original: "11920.92",
    assessment2024Paid: "11920.92",
    assessment2024Remaining: "0",
    assessment2024Status: "PAID IN FULL",
    onAssessmentPlan: false,
    delinquencyStatus: "current",
    priorityLevel: "low",
    redFlag: false,
    withAttorney: false,
    inForeclosure: false,
    legalNotes: "2024 assessment paid in full. Has credit balance of $636.77."
  },
  {
    unitNumber: "408",
    ownerName: "Sara Leviten",
    monthlyMaintenance: "578.45",
    monthlyPopularLoan: "0",
    monthlyAssessmentPlan: "0",
    maintenanceBalance: "0",
    popularLoanBalance: "0",
    creditBalance: "0",
    totalOwed: "2963.34",
    assessment2024Original: "11920.92",
    assessment2024Paid: "8957.58",
    assessment2024Remaining: "2963.34",
    assessment2024Status: "PARTIAL",
    onAssessmentPlan: false,
    delinquencyStatus: "current",
    priorityLevel: "low",
    redFlag: false,
    withAttorney: false,
    inForeclosure: false,
    legalNotes: "Making good progress on 2024 assessment. Current on maintenance."
  }
];

async function populate2024AssessmentData() {
  console.log("🏢 POPULATING 2024 SPECIAL ASSESSMENT DATA");
  console.log("=".repeat(70));
  console.log("");

  let successCount = 0;
  let errorCount = 0;

  // Calculate totals for summary
  const totalAssessment = assessment2024Data.length * 11920.92;
  const totalPaid = assessment2024Data.reduce((sum, unit) => sum + parseFloat(unit.assessment2024Paid), 0);
  const totalRemaining = assessment2024Data.reduce((sum, unit) => sum + parseFloat(unit.assessment2024Remaining), 0);

  const paidInFull = assessment2024Data.filter(u => u.assessment2024Status === "PAID IN FULL").length;
  const on3YearPlan = assessment2024Data.filter(u => u.assessment2024Status === "3-YEAR PLAN").length;
  const partial = assessment2024Data.filter(u => u.assessment2024Status === "PARTIAL").length;
  const unpaid = assessment2024Data.filter(u => u.assessment2024Status === "UNPAID").length;

  console.log("📊 ASSESSMENT SUMMARY:");
  console.log(`   Total Assessment: $${totalAssessment.toFixed(2)} (24 units × $11,920.92)`);
  console.log(`   Total Collected: $${totalPaid.toFixed(2)}`);
  console.log(`   Total Outstanding: $${totalRemaining.toFixed(2)}`);
  console.log(`   Collection Rate: ${((totalPaid / totalAssessment) * 100).toFixed(1)}%`);
  console.log("");
  console.log(`   ✅ Paid in Full: ${paidInFull} units`);
  console.log(`   📋 On 3-Year Plan: ${on3YearPlan} units`);
  console.log(`   📊 Partial Payment: ${partial} units`);
  console.log(`   🚩 Unpaid: ${unpaid} units`);
  console.log("");
  console.log("Updating units...");
  console.log("");

  for (const unitData of assessment2024Data) {
    try {
      // Find existing unit
      const existingUnit = await db
        .select()
        .from(units)
        .where(eq(units.unitNumber, unitData.unitNumber))
        .limit(1);

      if (existingUnit.length === 0) {
        console.log(`❌ Unit ${unitData.unitNumber} not found in database`);
        errorCount++;
        continue;
      }

      const unit = existingUnit[0];

      // Prepare update data
      const updateData: any = {
        // Monthly charges
        monthlyMaintenance: unitData.monthlyMaintenance,
        monthlyPopularLoan: unitData.monthlyPopularLoan,
        monthlyAssessmentPlan: unitData.monthlyAssessmentPlan,

        // Current balances
        maintenanceBalance: unitData.maintenanceBalance,
        popularLoanBalance: unitData.popularLoanBalance,
        creditBalance: unitData.creditBalance,
        totalOwed: unitData.totalOwed,

        // 2024 Assessment tracking
        assessment2024Original: unitData.assessment2024Original,
        assessment2024Paid: unitData.assessment2024Paid,
        assessment2024Remaining: unitData.assessment2024Remaining,
        assessment2024Status: unitData.assessment2024Status,

        // Payment plan
        onAssessmentPlan: unitData.onAssessmentPlan,
        assessmentPlanMonthly: unitData.assessmentPlanMonthly || "0",
        assessmentPlanMonthsTotal: unitData.assessmentPlanMonthsTotal || 0,
        assessmentPlanMonthsCompleted: unitData.assessmentPlanMonthsCompleted || 0,

        // Status
        delinquencyStatus: unitData.delinquencyStatus,
        priorityLevel: unitData.priorityLevel,
        redFlag: unitData.redFlag,
        withAttorney: unitData.withAttorney,
        inForeclosure: unitData.inForeclosure,
        legalNotes: unitData.legalNotes,
        updatedAt: new Date(),
      };

      // Add timestamp fields if provided
      if (unitData.assessmentPlanStartDate) {
        updateData.assessmentPlanStartDate = new Date(unitData.assessmentPlanStartDate);
      }
      if (unitData.assessmentPlanEndDate) {
        updateData.assessmentPlanEndDate = new Date(unitData.assessmentPlanEndDate);
      }

      // Update unit
      await db
        .update(units)
        .set(updateData)
        .where(eq(units.id, unit.id));

      // Status emoji
      let statusEmoji = "";
      if (unitData.assessment2024Status === "PAID IN FULL") statusEmoji = "✅";
      else if (unitData.assessment2024Status === "3-YEAR PLAN") statusEmoji = "📋";
      else if (unitData.assessment2024Status === "PARTIAL") statusEmoji = "📊";
      else if (unitData.assessment2024Status === "UNPAID") statusEmoji = "🚩";

      console.log(`${statusEmoji} Unit ${unitData.unitNumber} (${unitData.ownerName}): ${unitData.assessment2024Status}`);
      successCount++;

    } catch (error) {
      console.error(`❌ Error updating unit ${unitData.unitNumber}:`, error);
      errorCount++;
    }
  }

  console.log("");
  console.log("=".repeat(70));
  console.log(`✅ Successfully updated: ${successCount} units`);
  console.log(`❌ Errors: ${errorCount} units`);
  console.log("");
  console.log("🎯 KEY VERIFICATIONS:");
  console.log("   - Units 202 & 203: Should show '3-YEAR PLAN' status");
  console.log("   - Units 201, 205, 208, 307, 403, 407: Should show 'PAID IN FULL' ✅");
  console.log("   - Units 305, 308, 405: Should show 'UNPAID' with RED FLAG 🚩");
  console.log("   - Unit 407 (Brian Morrison): Should have $636.77 credit");
  console.log("");
  console.log("📊 NEXT: Check dashboard for 2024 Assessment status widget");
  console.log("=".repeat(70));
}

populate2024AssessmentData()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
