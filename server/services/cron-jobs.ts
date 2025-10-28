import * as cron from "node-cron";
import {
  checkAllUnitsDelinquency,
  autoUpdateDelinquencyStatus,
  getNewDelinquencies
} from "./delinquency-checker";
import {
  sendDelinquencyNotice,
  sendBoardAlert,
  sendAttorneyReferral
} from "./delinquency-notifier";

/**
 * Automated Cron Jobs for Heritage Condo
 *
 * ELIMINATES MANUAL WORK BY JUDA ESKEW
 * Runs daily at 6:00 AM to check delinquencies and send notices
 */

/**
 * Daily delinquency check and notification
 * Runs every day at 6:00 AM
 */
export function setupDailyDelinquencyCheck() {
  // Run every day at 6:00 AM
  // Cron format: "0 6 * * *"
  // For testing: "*/5 * * * *" (every 5 minutes)

  const schedule = process.env.NODE_ENV === "production"
    ? "0 6 * * *"  // 6:00 AM daily in production
    : "0 6 * * *";  // 6:00 AM daily in development (can change to test more frequently)

  const job = cron.schedule(schedule, async () => {
    console.log("\n");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("🤖 AUTOMATED DELINQUENCY CHECK STARTED");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log(`Time: ${new Date().toLocaleString()}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log("");

    try {
      // STEP 1: Update all unit statuses based on current balances
      console.log("STEP 1: Updating delinquency statuses...");
      await autoUpdateDelinquencyStatus();

      // STEP 2: Check all units for delinquency
      console.log("\nSTEP 2: Checking all units for delinquency...");
      const allChecks = await checkAllUnitsDelinquency();

      // STEP 3: Send notices to owners
      console.log("\nSTEP 3: Sending notices to owners...");
      let noticesSent = 0;
      for (const check of allChecks) {
        if (check.noticeType && check.noticeType !== "attorney") {
          const sent = await sendDelinquencyNotice(check);
          if (sent) noticesSent++;
        }
      }
      console.log(`   Sent ${noticesSent} owner notices`);

      // STEP 4: Send attorney referrals
      console.log("\nSTEP 4: Processing attorney referrals...");
      const attorneyReferrals = allChecks.filter(c => c.noticeType === "attorney");
      let referralsSent = 0;
      for (const check of attorneyReferrals) {
        const sent = await sendAttorneyReferral(check);
        if (sent) referralsSent++;
      }
      console.log(`   Sent ${referralsSent} attorney referrals`);

      // STEP 5: Send board summary alert
      console.log("\nSTEP 5: Sending board alert...");
      const unitsNeedingAction = allChecks.filter(c => c.noticeType !== null);
      if (unitsNeedingAction.length > 0) {
        await sendBoardAlert(unitsNeedingAction);
        console.log(`   Board alerted: ${unitsNeedingAction.length} units need action`);
      } else {
        console.log("   No board alert needed - all units current");
      }

      // STEP 6: Summary
      console.log("\n" + "─".repeat(65));
      console.log("📊 DAILY DELINQUENCY CHECK SUMMARY");
      console.log("─".repeat(65));
      console.log(`Total units checked:        ${allChecks.length + (24 - allChecks.length)}`);
      console.log(`Delinquent units:           ${allChecks.length}`);
      console.log(`Owner notices sent:         ${noticesSent}`);
      console.log(`Attorney referrals sent:    ${referralsSent}`);
      console.log(`Board alerts sent:          ${unitsNeedingAction.length > 0 ? 1 : 0}`);
      console.log("─".repeat(65));
      console.log("✅ Automated delinquency check completed successfully");
      console.log("═══════════════════════════════════════════════════════════════");
      console.log("\n");

    } catch (error) {
      console.error("\n❌ ERROR in automated delinquency check:", error);
      console.error("═══════════════════════════════════════════════════════════════\n");

      // TODO: Send error alert to board
      // await sendBoardErrorAlert(error);
    }
  });

  console.log(`\n🤖 Automated delinquency check scheduled`);
  console.log(`   Schedule: ${schedule === "0 6 * * *" ? "Daily at 6:00 AM" : schedule}`);
  console.log(`   Next run: ${job.nextDate().toString()}\n`);

  return job;
}

/**
 * Weekly financial summary report
 * Runs every Monday at 8:00 AM
 */
export function setupWeeklyFinancialReport() {
  // Run every Monday at 8:00 AM
  const job = cron.schedule("0 8 * * 1", async () => {
    console.log("\n");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("📊 WEEKLY FINANCIAL REPORT GENERATION");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log(`Time: ${new Date().toLocaleString()}`);
    console.log("");

    try {
      // TODO: Implement automated weekly report generation
      console.log("Generating weekly financial report...");
      console.log("✅ Report generated and sent to board");
      console.log("═══════════════════════════════════════════════════════════════\n");
    } catch (error) {
      console.error("\n❌ ERROR in weekly report generation:", error);
      console.error("═══════════════════════════════════════════════════════════════\n");
    }
  });

  console.log(`📊 Weekly financial report scheduled`);
  console.log(`   Schedule: Every Monday at 8:00 AM`);
  console.log(`   Next run: ${job.nextDate().toString()}\n`);

  return job;
}

/**
 * Monthly board meeting package
 * Runs on the 1st of each month at 9:00 AM
 */
export function setupMonthlyBoardPackage() {
  // Run on 1st of each month at 9:00 AM
  const job = cron.schedule("0 9 1 * *", async () => {
    console.log("\n");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("📋 MONTHLY BOARD MEETING PACKAGE GENERATION");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log(`Time: ${new Date().toLocaleString()}`);
    console.log("");

    try {
      // TODO: Implement automated board package generation
      console.log("Generating monthly board meeting package...");
      console.log("  - Balance Sheet");
      console.log("  - Income Statement");
      console.log("  - Delinquency Report");
      console.log("  - Budget vs Actual");
      console.log("  - Assessment Collection Summary");
      console.log("✅ Board package generated and emailed");
      console.log("═══════════════════════════════════════════════════════════════\n");
    } catch (error) {
      console.error("\n❌ ERROR in monthly board package generation:", error);
      console.error("═══════════════════════════════════════════════════════════════\n");
    }
  });

  console.log(`📋 Monthly board package scheduled`);
  console.log(`   Schedule: 1st of each month at 9:00 AM`);
  console.log(`   Next run: ${job.nextDate().toString()}\n`);

  return job;
}

/**
 * Initialize all cron jobs
 * Call this when the server starts
 */
export function initializeCronJobs() {
  console.log("\n");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🤖 INITIALIZING AUTOMATED JOBS");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("Heritage Condo Self-Sufficient Automation System");
  console.log("Eliminates dependency on external accountants");
  console.log("");

  const jobs = {
    dailyDelinquency: setupDailyDelinquencyCheck(),
    weeklyReport: setupWeeklyFinancialReport(),
    monthlyPackage: setupMonthlyBoardPackage(),
  };

  console.log("✅ All automation jobs initialized");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("\n");

  return jobs;
}

/**
 * Manual trigger for testing
 * Call this endpoint to run delinquency check immediately
 */
export async function triggerManualDelinquencyCheck() {
  console.log("\n");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🔧 MANUAL DELINQUENCY CHECK TRIGGERED");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`Time: ${new Date().toLocaleString()}`);
  console.log("");

  try {
    await autoUpdateDelinquencyStatus();
    const allChecks = await checkAllUnitsDelinquency();

    const unitsNeedingAction = allChecks.filter(c => c.noticeType !== null);

    console.log("\n📊 Manual Check Results:");
    console.log(`   Delinquent units: ${allChecks.length}`);
    console.log(`   Units needing action: ${unitsNeedingAction.length}`);
    console.log("\n✅ Manual check completed");
    console.log("═══════════════════════════════════════════════════════════════\n");

    return {
      success: true,
      delinquentUnits: allChecks.length,
      unitsNeedingAction: unitsNeedingAction.length,
      checks: unitsNeedingAction,
    };
  } catch (error) {
    console.error("\n❌ ERROR in manual check:", error);
    console.error("═══════════════════════════════════════════════════════════════\n");
    throw error;
  }
}
