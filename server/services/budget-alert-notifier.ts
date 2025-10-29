/**
 * Budget Alert Email Notification Service
 *
 * Automated over-budget alerts for board members
 * Sends critical and warning notifications when spending exceeds budget
 */

import nodemailer from "nodemailer";
import type { VarianceItem, BudgetVarianceReport } from "./budget-variance";
import { db } from "../db";
import { users } from "../../shared/schema";
import { inArray } from "drizzle-orm";

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send critical over-budget alert to board members
 */
export async function sendCriticalBudgetAlert(
  report: BudgetVarianceReport,
  criticalCategories: VarianceItem[]
): Promise<void> {
  try {
    // Get all board member emails
    const boardMembers = await db
      .select()
      .from(users)
      .where(
        inArray(users.role, ["board_secretary", "board_treasurer", "board_member"])
      );

    const boardEmails = boardMembers
      .filter(u => u.email)
      .map(u => u.email as string);

    if (boardEmails.length === 0) {
      console.log("⚠️ No board member emails found for budget alert");
      return;
    }

    const subject = `🚨 CRITICAL: Budget Alert for ${getMonthName(report.month)} ${report.year}`;

    const categoriesList = criticalCategories
      .map(cat =>
        `  • ${cat.category}${cat.subcategory ? ` - ${cat.subcategory}` : ""}: ` +
        `$${cat.actual.toFixed(2)} vs $${cat.budgeted.toFixed(2)} budgeted ` +
        `(${cat.variancePercent > 0 ? '+' : ''}${cat.variancePercent.toFixed(1)}%)`
      )
      .join('\n');

    const body = `
Dear Heritage Condominium Board Members,

🚨 CRITICAL BUDGET ALERT

${criticalCategories.length} expense categories are significantly over budget for ${getMonthName(report.month)} ${report.year}.

CRITICAL CATEGORIES (>20% over budget):
${categoriesList}

OVERALL SPENDING SUMMARY:
• Total Budgeted: $${report.totalBudgeted.toFixed(2)}
• Total Actual: $${report.totalActual.toFixed(2)}
• Variance: ${report.totalVariance >= 0 ? '+' : ''}$${report.totalVariance.toFixed(2)} (${report.totalVariancePercent.toFixed(1)}%)

${report.summary}

IMMEDIATE ACTION REQUIRED:
1. Review spending in over-budget categories
2. Investigate causes of overruns
3. Implement corrective measures
4. Consider budget amendment if structural issue

You can view the detailed budget variance report at:
heritage-condo-management-north-miami.netlify.app/board-dashboard

This automated alert is part of Heritage Condo's self-sufficient financial tracking system.

---
Heritage Condominium Association
Automated Budget Monitoring System
    `.trim();

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Heritage Condo Board" <board@heritagecondo.com>',
      to: boardEmails.join(", "),
      subject,
      text: body,
    });

    console.log(`✅ Critical budget alert sent to ${boardEmails.length} board members`);
  } catch (error) {
    console.error("❌ Error sending critical budget alert:", error);
    throw error;
  }
}

/**
 * Send warning-level over-budget alert to board members
 */
export async function sendWarningBudgetAlert(
  report: BudgetVarianceReport,
  warningCategories: VarianceItem[]
): Promise<void> {
  try {
    const boardMembers = await db
      .select()
      .from(users)
      .where(
        inArray(users.role, ["board_secretary", "board_treasurer", "board_member"])
      );

    const boardEmails = boardMembers
      .filter(u => u.email)
      .map(u => u.email as string);

    if (boardEmails.length === 0) {
      console.log("⚠️ No board member emails found for budget alert");
      return;
    }

    const subject = `⚠️ Budget Warning: ${getMonthName(report.month)} ${report.year}`;

    const categoriesList = warningCategories
      .map(cat =>
        `  • ${cat.category}${cat.subcategory ? ` - ${cat.subcategory}` : ""}: ` +
        `$${cat.actual.toFixed(2)} vs $${cat.budgeted.toFixed(2)} budgeted ` +
        `(${cat.variancePercent > 0 ? '+' : ''}${cat.variancePercent.toFixed(1)}%)`
      )
      .join('\n');

    const body = `
Dear Heritage Condominium Board Members,

⚠️ BUDGET WARNING

${warningCategories.length} expense categories are over budget for ${getMonthName(report.month)} ${report.year}.

CATEGORIES NEEDING ATTENTION (10-20% over budget):
${categoriesList}

OVERALL SPENDING SUMMARY:
• Total Budgeted: $${report.totalBudgeted.toFixed(2)}
• Total Actual: $${report.totalActual.toFixed(2)}
• Variance: ${report.totalVariance >= 0 ? '+' : ''}$${report.totalVariance.toFixed(2)} (${report.totalVariancePercent.toFixed(1)}%)

${report.summary}

RECOMMENDED ACTIONS:
1. Monitor these categories closely
2. Review spending patterns
3. Consider budget adjustments if trend continues

View detailed report at:
heritage-condo-management-north-miami.netlify.app/board-dashboard

---
Heritage Condominium Association
Automated Budget Monitoring System
    `.trim();

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Heritage Condo Board" <board@heritagecondo.com>',
      to: boardEmails.join(", "),
      subject,
      text: body,
    });

    console.log(`✅ Warning budget alert sent to ${boardEmails.length} board members`);
  } catch (error) {
    console.error("❌ Error sending warning budget alert:", error);
    throw error;
  }
}

/**
 * Send monthly budget variance summary to board members
 */
export async function sendMonthlyBudgetSummary(
  report: BudgetVarianceReport
): Promise<void> {
  try {
    const boardMembers = await db
      .select()
      .from(users)
      .where(
        inArray(users.role, ["board_secretary", "board_treasurer", "board_member"])
      );

    const boardEmails = boardMembers
      .filter(u => u.email)
      .map(u => u.email as string);

    if (boardEmails.length === 0) {
      console.log("⚠️ No board member emails found for monthly budget summary");
      return;
    }

    const statusIcon = report.overBudgetCount === 0 ? "✅" :
                       report.criticalCategories.length > 0 ? "🚨" : "⚠️";

    const subject = `${statusIcon} Monthly Budget Report: ${getMonthName(report.month)} ${report.year}`;

    // Top 5 expense variances (by absolute value)
    const topExpenses = report.expenseVariances
      .slice(0, 5)
      .map(cat =>
        `  ${cat.severity === 'critical' ? '🚨' : cat.severity === 'warning' ? '⚠️' : '✅'} ` +
        `${cat.category}: $${cat.actual.toFixed(2)} / $${cat.budgeted.toFixed(2)} ` +
        `(${cat.variancePercent > 0 ? '+' : ''}${cat.variancePercent.toFixed(1)}%)`
      )
      .join('\n');

    const body = `
Dear Heritage Condominium Board Members,

MONTHLY BUDGET VARIANCE REPORT
${getMonthName(report.month)} ${report.year}

SUMMARY:
${report.summary}

OVERALL SPENDING:
• Total Budgeted: $${report.totalBudgeted.toFixed(2)}
• Total Actual: $${report.totalActual.toFixed(2)}
• Variance: ${report.totalVariance >= 0 ? '+' : ''}$${report.totalVariance.toFixed(2)} (${report.totalVariancePercent.toFixed(1)}%)
• Over-Budget Categories: ${report.overBudgetCount}

TOP EXPENSE CATEGORIES:
${topExpenses}

${report.criticalCategories.length > 0 ? `
⚠️ CRITICAL ISSUES:
${report.criticalCategories.length} categories are >20% over budget and require immediate attention.
` : ''}

View full detailed variance report with all categories at:
heritage-condo-management-north-miami.netlify.app/board-dashboard

This is an automated monthly report from Heritage Condo's financial tracking system.

---
Heritage Condominium Association
Automated Budget Monitoring System
Generated: ${report.generatedAt.toLocaleString()}
    `.trim();

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Heritage Condo Board" <board@heritagecondo.com>',
      to: boardEmails.join(", "),
      subject,
      text: body,
    });

    console.log(`✅ Monthly budget summary sent to ${boardEmails.length} board members`);
  } catch (error) {
    console.error("❌ Error sending monthly budget summary:", error);
    throw error;
  }
}

/**
 * Helper: Get month name from number (1-12)
 */
function getMonthName(month: number): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[month - 1] || "Unknown";
}

/**
 * Test email configuration
 */
export async function testBudgetAlertEmail(testEmail: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Heritage Condo Board" <board@heritagecondo.com>',
    to: testEmail,
    subject: "Test: Budget Alert System",
    text: "This is a test email from Heritage Condo's automated budget alert system. If you received this, the email configuration is working correctly.",
  });

  console.log(`✅ Test email sent to ${testEmail}`);
}
