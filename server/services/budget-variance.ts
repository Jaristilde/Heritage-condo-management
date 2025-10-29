/**
 * Budget Variance Analysis Service
 *
 * Automated tracking of budget vs actual spending
 * Identifies over-budget categories and generates variance reports
 */

import { db } from "../db";
import { monthlyBudget, invoices, payments } from "../../shared/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export interface VarianceItem {
  category: string;
  subcategory: string | null;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
  status: "over" | "under" | "on-track";
  severity: "critical" | "warning" | "ok";
}

export interface BudgetVarianceReport {
  month: number;
  year: number;
  generatedAt: Date;
  totalBudgeted: number;
  totalActual: number;
  totalVariance: number;
  totalVariancePercent: number;
  expenseVariances: VarianceItem[];
  revenueVariances: VarianceItem[];
  overBudgetCount: number;
  criticalCategories: VarianceItem[];
  summary: string;
}

/**
 * Get budget variance for a specific month and year
 */
export async function getBudgetVariance(
  year: number,
  month: number
): Promise<BudgetVarianceReport> {
  // Get budget items for the year
  const budgetItems = await db
    .select()
    .from(monthlyBudget)
    .where(eq(monthlyBudget.year, year));

  if (budgetItems.length === 0) {
    throw new Error(`No budget found for year ${year}`);
  }

  // Calculate date range for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month

  // Get actual expenses from invoices
  const actualExpenses = await db
    .select({
      category: invoices.glCode,
      total: sql<number>`COALESCE(SUM(CAST(${invoices.amount} AS DECIMAL)), 0)`,
    })
    .from(invoices)
    .where(
      and(
        gte(invoices.invoiceDate, startDate),
        lte(invoices.invoiceDate, endDate),
        eq(invoices.status, "paid")
      )
    )
    .groupBy(invoices.glCode);

  // Get actual revenue from payments
  const actualRevenue = await db
    .select({
      type: payments.paymentType,
      total: sql<number>`COALESCE(SUM(CAST(${payments.amount} AS DECIMAL)), 0)`,
    })
    .from(payments)
    .where(
      and(
        gte(payments.paidAt, startDate),
        lte(payments.paidAt, endDate)
      )
    )
    .groupBy(payments.paymentType);

  // Build expense variance report
  const expenseVariances: VarianceItem[] = [];
  let totalExpenseBudgeted = 0;
  let totalExpenseActual = 0;

  for (const budgetItem of budgetItems.filter(b => b.categoryType === "expense")) {
    const budgeted = parseFloat(budgetItem.monthlyBudget);
    const actualExpense = actualExpenses.find(
      a => a.category === budgetItem.category || a.category === budgetItem.subcategory
    );
    const actual = actualExpense ? parseFloat(actualExpense.total.toString()) : 0;
    const variance = actual - budgeted;
    const variancePercent = budgeted > 0 ? (variance / budgeted) * 100 : 0;

    totalExpenseBudgeted += budgeted;
    totalExpenseActual += actual;

    let status: "over" | "under" | "on-track" = "on-track";
    let severity: "critical" | "warning" | "ok" = "ok";

    if (variance > 0) {
      status = "over";
      if (variancePercent > 20) {
        severity = "critical";
      } else if (variancePercent > 10) {
        severity = "warning";
      }
    } else if (variance < 0) {
      status = "under";
    } else {
      status = "on-track";
    }

    // Only include if there's actual spending or budget
    if (budgeted > 0 || actual > 0) {
      expenseVariances.push({
        category: budgetItem.category,
        subcategory: budgetItem.subcategory,
        budgeted,
        actual,
        variance,
        variancePercent,
        status,
        severity,
      });
    }
  }

  // Build revenue variance report
  const revenueVariances: VarianceItem[] = [];
  let totalRevenueBudgeted = 0;
  let totalRevenueActual = 0;

  for (const budgetItem of budgetItems.filter(b => b.categoryType === "revenue")) {
    const budgeted = parseFloat(budgetItem.monthlyBudget);
    const actualRev = actualRevenue.find(
      a => a.type === budgetItem.subcategory ||
           a.type === budgetItem.category.toLowerCase().replace(/_/g, " ")
    );
    const actual = actualRev ? parseFloat(actualRev.total.toString()) : 0;
    const variance = actual - budgeted;
    const variancePercent = budgeted > 0 ? (variance / budgeted) * 100 : 0;

    totalRevenueBudgeted += budgeted;
    totalRevenueActual += actual;

    let status: "over" | "under" | "on-track" = "on-track";
    let severity: "critical" | "warning" | "ok" = "ok";

    if (variance > 0) {
      status = "over"; // More revenue = good
      severity = "ok";
    } else if (variance < 0) {
      status = "under"; // Less revenue = bad
      if (Math.abs(variancePercent) > 10) {
        severity = "critical";
      } else if (Math.abs(variancePercent) > 5) {
        severity = "warning";
      }
    }

    if (budgeted > 0 || actual > 0) {
      revenueVariances.push({
        category: budgetItem.category,
        subcategory: budgetItem.subcategory,
        budgeted,
        actual,
        variance,
        variancePercent,
        status,
        severity,
      });
    }
  }

  // Calculate totals
  const totalBudgeted = totalRevenueBudgeted - totalExpenseBudgeted;
  const totalActual = totalRevenueActual - totalExpenseActual;
  const totalVariance = totalActual - totalBudgeted;
  const totalVariancePercent = totalBudgeted !== 0
    ? (totalVariance / Math.abs(totalBudgeted)) * 100
    : 0;

  // Identify critical categories
  const criticalCategories = expenseVariances.filter(v => v.severity === "critical");
  const overBudgetCount = expenseVariances.filter(v => v.status === "over").length;

  // Generate summary
  let summary = "";
  if (criticalCategories.length > 0) {
    summary = `⚠️ ${criticalCategories.length} categories critically over budget. `;
  } else if (overBudgetCount > 0) {
    summary = `${overBudgetCount} categories over budget. `;
  } else {
    summary = "All categories within budget. ";
  }

  if (totalVariancePercent > 10) {
    summary += `Total expenses ${totalVariancePercent.toFixed(1)}% over budget.`;
  } else if (totalVariancePercent < -10) {
    summary += `Total expenses ${Math.abs(totalVariancePercent).toFixed(1)}% under budget.`;
  } else {
    summary += "Overall spending on track.";
  }

  return {
    month,
    year,
    generatedAt: new Date(),
    totalBudgeted: totalExpenseBudgeted,
    totalActual: totalExpenseActual,
    totalVariance: totalExpenseActual - totalExpenseBudgeted,
    totalVariancePercent: totalExpenseBudgeted > 0
      ? ((totalExpenseActual - totalExpenseBudgeted) / totalExpenseBudgeted) * 100
      : 0,
    expenseVariances: expenseVariances.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance)),
    revenueVariances: revenueVariances.sort((a, b) => b.variance - a.variance),
    overBudgetCount,
    criticalCategories,
    summary,
  };
}

/**
 * Get year-to-date budget variance
 */
export async function getYTDBudgetVariance(year: number): Promise<{
  year: number;
  monthsAnalyzed: number;
  totalBudgeted: number;
  totalActual: number;
  totalVariance: number;
  totalVariancePercent: number;
  monthlyReports: BudgetVarianceReport[];
  averageVariancePercent: number;
}> {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Determine how many months to analyze
  const monthsToAnalyze = year === currentYear ? currentMonth : 12;

  const monthlyReports: BudgetVarianceReport[] = [];
  let totalBudgeted = 0;
  let totalActual = 0;

  for (let month = 1; month <= monthsToAnalyze; month++) {
    try {
      const report = await getBudgetVariance(year, month);
      monthlyReports.push(report);
      totalBudgeted += report.totalBudgeted;
      totalActual += report.totalActual;
    } catch (error) {
      console.error(`Error getting variance for ${year}-${month}:`, error);
    }
  }

  const totalVariance = totalActual - totalBudgeted;
  const totalVariancePercent = totalBudgeted > 0 ? (totalVariance / totalBudgeted) * 100 : 0;
  const averageVariancePercent = monthlyReports.length > 0
    ? monthlyReports.reduce((sum, r) => sum + r.totalVariancePercent, 0) / monthlyReports.length
    : 0;

  return {
    year,
    monthsAnalyzed: monthsToAnalyze,
    totalBudgeted,
    totalActual,
    totalVariance,
    totalVariancePercent,
    monthlyReports,
    averageVariancePercent,
  };
}

/**
 * Check for over-budget categories that need alerts
 */
export async function checkOverBudgetAlerts(
  year: number,
  month: number
): Promise<{
  hasAlerts: boolean;
  criticalCount: number;
  warningCount: number;
  categories: VarianceItem[];
  message: string;
}> {
  const report = await getBudgetVariance(year, month);

  const alertCategories = report.expenseVariances.filter(
    v => v.severity === "critical" || v.severity === "warning"
  );

  const criticalCount = alertCategories.filter(v => v.severity === "critical").length;
  const warningCount = alertCategories.filter(v => v.severity === "warning").length;

  let message = "";
  if (criticalCount > 0) {
    message = `🚨 ${criticalCount} categories are critically over budget (>20%). `;
  }
  if (warningCount > 0) {
    message += `⚠️ ${warningCount} categories need attention (>10% over budget).`;
  }

  return {
    hasAlerts: alertCategories.length > 0,
    criticalCount,
    warningCount,
    categories: alertCategories,
    message: message || "All categories within acceptable budget variance.",
  };
}
