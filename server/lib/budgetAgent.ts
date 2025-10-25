import { db } from "../db";
import { units, payments, vendors, monthlyBudget } from "../../shared/schema";
import { sql, eq, gte, lte, and } from "drizzle-orm";
import { generateBudgetProposal, BudgetAnalysisData } from "./aiCommentary";

export async function analyzeBudgetProposal(
  targetYear: number,
  userId: string
): Promise<{
  executiveSummary: string;
  recommendedAssessment: number;
  assessmentChange: string;
  scenarios: any;
  revenueProjections: any;
  expenseProjections: any;
  capitalProjects: any;
  risks: any;
  recommendations: any;
}> {
  const currentYear = targetYear - 1;

  const allUnits = await db.select().from(units);
  const totalUnits = allUnits.length;
  
  const currentAssessment = allUnits.length > 0 
    ? parseFloat(allUnits[0].monthlyMaintenance) 
    : 600;

  const currentYearStart = new Date(currentYear, 0, 1);
  const currentYearEnd = new Date(currentYear, 11, 31);
  
  const paymentsThisYear = await db
    .select()
    .from(payments)
    .where(
      and(
        gte(payments.paidAt, currentYearStart),
        lte(payments.paidAt, currentYearEnd)
      )
    );

  const monthlyRevenueMap = new Map<number, number>();
  const monthlyExpensesMap = new Map<number, number>();
  
  for (let month = 0; month < 12; month++) {
    monthlyRevenueMap.set(month, 0);
    monthlyExpensesMap.set(month, 0);
  }
  
  paymentsThisYear.forEach(payment => {
    const month = new Date(payment.paidAt).getMonth();
    const amount = parseFloat(payment.amount);
    monthlyRevenueMap.set(month, (monthlyRevenueMap.get(month) || 0) + amount);
  });

  const allVendors = await db.select().from(vendors);
  const totalMonthlyVendorCosts = allVendors.reduce(
    (sum, v) => sum + (v.monthlyCost ? parseFloat(v.monthlyCost) : 0),
    0
  );

  for (let month = 0; month < 12; month++) {
    monthlyExpensesMap.set(month, totalMonthlyVendorCosts);
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthlyRevenue = Array.from(monthlyRevenueMap.entries()).map(([month, amount]) => ({
    month: monthNames[month],
    amount,
  }));

  const monthlyExpenses = Array.from(monthlyExpensesMap.entries()).map(([month, amount]) => ({
    month: monthNames[month],
    amount,
  }));

  const totalRevenue = Array.from(monthlyRevenueMap.values()).reduce((sum, val) => sum + val, 0);
  const totalExpenses = Array.from(monthlyExpensesMap.values()).reduce((sum, val) => sum + val, 0);
  const netIncome = totalRevenue - totalExpenses;

  const totalPossibleRevenue = currentAssessment * totalUnits * 12;
  const averageCollectionRate = totalPossibleRevenue > 0 
    ? (totalRevenue / totalPossibleRevenue) * 100 
    : 83;

  const expensesByCategory = new Map<string, { total: number; count: number }>();
  
  allVendors.forEach(vendor => {
    const category = vendor.serviceType || "Other";
    const monthlyCost = vendor.monthlyCost ? parseFloat(vendor.monthlyCost) : 0;
    const annualCost = monthlyCost * 12;
    
    if (!expensesByCategory.has(category)) {
      expensesByCategory.set(category, { total: 0, count: 0 });
    }
    const current = expensesByCategory.get(category)!;
    current.total += annualCost;
    current.count += 1;
  });

  const expenseCategories = Array.from(expensesByCategory.entries()).map(([category, data]) => ({
    category,
    currentYearTotal: data.total,
    averageMonthly: data.total / 12,
    trend: "stable" as const,
  }));

  const delinquentUnits = allUnits.filter(u => 
    u.delinquencyStatus !== "current" && 
    parseFloat(u.totalOwed) > 0
  );
  const delinquencyRate = (delinquentUnits.length / totalUnits) * 100;

  const reserveFundBalance = 150000;
  const reserveFundTarget = 200000;

  const budgetData: BudgetAnalysisData = {
    currentYear,
    nextYear: targetYear,
    historicalData: {
      monthlyRevenue,
      monthlyExpenses,
      averageCollectionRate,
    },
    currentAssessment,
    totalUnits,
    currentYearProjections: {
      totalRevenue,
      totalExpenses,
      netIncome,
    },
    expenseCategories,
    capitalNeeds: [
      { item: "Elevator modernization", estimatedCost: 45000, urgency: "within_year" },
      { item: "Roof inspection and minor repairs", estimatedCost: 12000, urgency: "within_year" },
      { item: "Hallway painting", estimatedCost: 8000, urgency: "future" },
      { item: "Pool resurfacing", estimatedCost: 25000, urgency: "future" },
    ],
    reserveFundBalance,
    reserveFundTarget,
    delinquencyRate,
  };

  const aiProposal = await generateBudgetProposal(budgetData);

  return {
    executiveSummary: aiProposal.executiveSummary,
    recommendedAssessment: aiProposal.recommendedAssessment,
    assessmentChange: aiProposal.assessmentChange,
    scenarios: aiProposal.scenarios,
    revenueProjections: aiProposal.scenarios.moderate,
    expenseProjections: aiProposal.scenarios.moderate,
    capitalProjects: aiProposal.scenarios.moderate.capitalProjects,
    risks: aiProposal.risks,
    recommendations: aiProposal.recommendations,
  };
}
