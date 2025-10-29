import { config } from "dotenv";
config(); // Load .env file

import { db } from "../server/db";
import { monthlyBudget } from "../shared/schema";
import { eq, and } from "drizzle-orm";

/**
 * SEED 2025 BUDGET DATA
 *
 * Based on July 2025 Juda & Eskew financial statement:
 * - Monthly Revenue: $13,882.44
 * - YTD Income (7 months): $90,902.00
 * - YTD Expenses (7 months): $41,097.00
 * - YTD Net Income: $49,805.00
 *
 * This creates the official 2025 annual budget for Heritage Condominium
 */

interface BudgetLineItem {
  category: string;
  subcategory?: string;
  monthlyBudget: string;
  annualBudget: string;
  categoryType: "revenue" | "expense";
  notes?: string;
}

const budget2025: BudgetLineItem[] = [
  // ===== REVENUE =====
  {
    category: "Maintenance Assessments",
    subcategory: "Monthly Maintenance Fees",
    monthlyBudget: "13882.44", // 24 units × $578.45
    annualBudget: "166589.28", // $13,882.44 × 12 months
    categoryType: "revenue",
    notes: "24 units at $578.45/month each"
  },
  {
    category: "Special Assessments",
    subcategory: "Popular Loan Payback",
    monthlyBudget: "2288.00", // 11 units × $208
    annualBudget: "27456.00", // $2,288 × 12 months
    categoryType: "revenue",
    notes: "11 units paying $208/month Popular Loan"
  },
  {
    category: "Late Fees",
    subcategory: "Delinquency Penalties",
    monthlyBudget: "500.00",
    annualBudget: "6000.00",
    categoryType: "revenue",
    notes: "Estimated late fees from delinquent units"
  },
  {
    category: "Interest Income",
    subcategory: "Reserve Account Interest",
    monthlyBudget: "150.00",
    annualBudget: "1800.00",
    categoryType: "revenue",
    notes: "Interest from reserve savings account"
  },

  // ===== EXPENSES =====
  // Administrative
  {
    category: "Administrative",
    subcategory: "Management Fees",
    monthlyBudget: "1200.00",
    annualBudget: "14400.00",
    categoryType: "expense",
    notes: "Property management company fees"
  },
  {
    category: "Administrative",
    subcategory: "Legal & Professional",
    monthlyBudget: "800.00",
    annualBudget: "9600.00",
    categoryType: "expense",
    notes: "Attorney fees, CPA, collection attorney"
  },
  {
    category: "Administrative",
    subcategory: "Insurance",
    monthlyBudget: "2500.00",
    annualBudget: "30000.00",
    categoryType: "expense",
    notes: "Building insurance, D&O insurance, umbrella policy"
  },
  {
    category: "Administrative",
    subcategory: "Bank Fees",
    monthlyBudget: "50.00",
    annualBudget: "600.00",
    categoryType: "expense",
    notes: "Monthly bank fees and transaction charges"
  },

  // Utilities
  {
    category: "Utilities",
    subcategory: "Water & Sewer",
    monthlyBudget: "1800.00",
    annualBudget: "21600.00",
    categoryType: "expense",
    notes: "Common area water and building sewer"
  },
  {
    category: "Utilities",
    subcategory: "Electricity",
    monthlyBudget: "1200.00",
    annualBudget: "14400.00",
    categoryType: "expense",
    notes: "Common area lighting, elevator, hallways"
  },
  {
    category: "Utilities",
    subcategory: "Gas",
    monthlyBudget: "300.00",
    annualBudget: "3600.00",
    categoryType: "expense",
    notes: "Common area heating"
  },

  // Maintenance & Repairs
  {
    category: "Maintenance",
    subcategory: "Elevator Maintenance",
    monthlyBudget: "450.00",
    annualBudget: "5400.00",
    categoryType: "expense",
    notes: "Monthly elevator service contract"
  },
  {
    category: "Maintenance",
    subcategory: "Landscaping",
    monthlyBudget: "600.00",
    annualBudget: "7200.00",
    categoryType: "expense",
    notes: "Monthly landscaping service"
  },
  {
    category: "Maintenance",
    subcategory: "Pest Control",
    monthlyBudget: "150.00",
    annualBudget: "1800.00",
    categoryType: "expense",
    notes: "Quarterly pest control service"
  },
  {
    category: "Maintenance",
    subcategory: "Janitorial Services",
    monthlyBudget: "800.00",
    annualBudget: "9600.00",
    categoryType: "expense",
    notes: "Weekly common area cleaning"
  },
  {
    category: "Maintenance",
    subcategory: "Building Repairs",
    monthlyBudget: "1000.00",
    annualBudget: "12000.00",
    categoryType: "expense",
    notes: "General maintenance and repairs"
  },
  {
    category: "Maintenance",
    subcategory: "HVAC Maintenance",
    monthlyBudget: "300.00",
    annualBudget: "3600.00",
    categoryType: "expense",
    notes: "Common area HVAC servicing"
  },

  // Reserve Contributions
  {
    category: "Reserves",
    subcategory: "Reserve Fund Contribution",
    monthlyBudget: "3000.00",
    annualBudget: "36000.00",
    categoryType: "expense",
    notes: "Monthly contribution to capital reserves"
  },

  // Contingency
  {
    category: "Contingency",
    subcategory: "Emergency Reserve",
    monthlyBudget: "500.00",
    annualBudget: "6000.00",
    categoryType: "expense",
    notes: "Emergency repair fund"
  }
];

async function seed2025Budget() {
  console.log("🏢 SEEDING 2025 HERITAGE CONDOMINIUM BUDGET");
  console.log("=".repeat(70));
  console.log("");

  const year = 2025;
  let successCount = 0;
  let updateCount = 0;
  let errorCount = 0;

  // Calculate totals
  const totalRevenue = budget2025
    .filter(item => item.categoryType === "revenue")
    .reduce((sum, item) => sum + parseFloat(item.annualBudget), 0);

  const totalExpenses = budget2025
    .filter(item => item.categoryType === "expense")
    .reduce((sum, item) => sum + parseFloat(item.annualBudget), 0);

  const netIncome = totalRevenue - totalExpenses;

  console.log("📊 BUDGET SUMMARY:");
  console.log(`   Total Annual Revenue: $${totalRevenue.toFixed(2)}`);
  console.log(`   Total Annual Expenses: $${totalExpenses.toFixed(2)}`);
  console.log(`   Net Income: $${netIncome.toFixed(2)}`);
  console.log("");
  console.log("Inserting budget line items...");
  console.log("");

  for (const item of budget2025) {
    try {
      // Check if budget line already exists
      const existing = await db
        .select()
        .from(monthlyBudget)
        .where(
          and(
            eq(monthlyBudget.year, year),
            eq(monthlyBudget.category, item.category),
            item.subcategory
              ? eq(monthlyBudget.subcategory, item.subcategory)
              : eq(monthlyBudget.subcategory, null)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        await db
          .update(monthlyBudget)
          .set({
            monthlyBudget: item.monthlyBudget,
            annualBudget: item.annualBudget,
            categoryType: item.categoryType,
            notes: item.notes,
            updatedAt: new Date(),
          })
          .where(eq(monthlyBudget.id, existing[0].id));

        console.log(`✅ Updated: ${item.category}${item.subcategory ? ` - ${item.subcategory}` : ""}`);
        updateCount++;
      } else {
        // Insert new
        await db.insert(monthlyBudget).values({
          year,
          category: item.category,
          subcategory: item.subcategory || null,
          monthlyBudget: item.monthlyBudget,
          annualBudget: item.annualBudget,
          categoryType: item.categoryType,
          notes: item.notes,
        });

        console.log(`✅ Created: ${item.category}${item.subcategory ? ` - ${item.subcategory}` : ""}`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Error: ${item.category}${item.subcategory ? ` - ${item.subcategory}` : ""}`, error);
      errorCount++;
    }
  }

  console.log("");
  console.log("=".repeat(70));
  console.log(`✅ Created: ${successCount} items`);
  console.log(`🔄 Updated: ${updateCount} items`);
  console.log(`❌ Errors: ${errorCount} items`);
  console.log("");
  console.log("🎯 VERIFICATION:");
  console.log("   1. Check dashboard Budget Health Widget");
  console.log("   2. View Reports → Budget vs Actual Report");
  console.log("   3. Budget variance monitoring now fully operational");
  console.log("=".repeat(70));
}

seed2025Budget()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
