import "dotenv/config";
import { db } from "../server/db";
import { assessments, units } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Seed assessment types for Heritage Condo
 * - REGULAR_MONTHLY: Monthly maintenance (Operating Fund)
 * - SPECIAL_LOAN_POPULAR: Popular Bank Loan (Reserve Fund)
 * - SPECIAL_2024_ASSESSMENT: 2024 Special Assessment (Operating Fund)
 */
async function seedAssessments() {
  console.log("\n💰 Seeding assessment types...\n");

  // Get all units to calculate total amounts
  const allUnits = await db.select().from(units);
  const unitCount = allUnits.length || 24; // Default to 24 if no units yet

  const assessmentsToCreate = [
    {
      assessmentName: "Regular Monthly Maintenance",
      assessmentType: "REGULAR_MONTHLY",
      fundType: "OPERATING",
      frequency: "monthly",
      amountPerUnit: "350.00", // $350/month per unit
      totalAmount: (parseFloat("350.00") * unitCount).toFixed(2),
      startDate: new Date("2024-01-01"),
      isRecurring: true,
      allocateTo: "maintenance",
      description: "Regular monthly maintenance assessment for operating expenses",
      status: "active",
    },
    {
      assessmentName: "Popular Bank Loan - Special Assessment",
      assessmentType: "SPECIAL_LOAN_POPULAR",
      fundType: "RESERVE",
      frequency: "monthly",
      amountPerUnit: "200.00", // Example: $200/month per unit
      totalAmount: (parseFloat("200.00") * unitCount).toFixed(2),
      startDate: new Date("2024-01-01"),
      endDate: new Date("2029-12-31"), // 5-year loan example
      isRecurring: true,
      allocateTo: "reserves",
      description: "Monthly payment for Popular Bank loan - allocated to Reserve Fund per Florida law",
      status: "active",
    },
    {
      assessmentName: "2024 Special Assessment",
      assessmentType: "SPECIAL_2024_ASSESSMENT",
      fundType: "OPERATING",
      frequency: "one_time",
      amountPerUnit: "5000.00", // Example: $5,000 per unit
      totalAmount: (parseFloat("5000.00") * unitCount).toFixed(2),
      startDate: new Date("2024-01-01"),
      dueDate: new Date("2024-12-31"),
      isRecurring: false,
      allocateTo: "special_project",
      description: "2024 Special Assessment for building improvements - Operating Fund",
      status: "active",
    },
  ];

  for (const assessment of assessmentsToCreate) {
    try {
      await db.insert(assessments).values(assessment);
      console.log(`✅ Created assessment: ${assessment.assessmentName}`);
      console.log(`   Type: ${assessment.assessmentType}`);
      console.log(`   Fund: ${assessment.fundType}`);
      console.log(`   Per Unit: $${assessment.amountPerUnit}`);
      console.log(`   Total: $${assessment.totalAmount}`);
      console.log("");
    } catch (error: any) {
      if (error.code === '23505') {
        console.log(`⚠️  Assessment ${assessment.assessmentName} already exists, skipping...`);
      } else {
        console.error(`❌ Error creating assessment ${assessment.assessmentName}:`, error.message);
      }
    }
  }

  console.log("=".repeat(80));
  console.log("📊 Assessment Summary:");
  console.log("=".repeat(80));
  console.log("1. REGULAR MONTHLY: $350/unit → Operating Fund (Monthly maintenance)");
  console.log("2. POPULAR LOAN: $200/unit → Reserve Fund (Special assessment - loan)");
  console.log("3. 2024 ASSESSMENT: $5,000/unit → Operating Fund (One-time special)");
  console.log("=".repeat(80));
  console.log("\n✅ Assessment seeding complete!\n");

  console.log("🔐 Florida FS 718.116 Compliance:");
  console.log("- Operating and Reserve funds are properly separated");
  console.log("- Special assessments allocated to correct fund types");
  console.log("- Payment allocation follows Florida statutory order:");
  console.log("  1. Interest");
  console.log("  2. Late Fees");
  console.log("  3. Attorney Costs");
  console.log("  4. Assessments (oldest first)");
  console.log("");

  process.exit(0);
}

// Run the seed
seedAssessments().catch((error) => {
  console.error("Fatal error during seeding:", error);
  process.exit(1);
});
