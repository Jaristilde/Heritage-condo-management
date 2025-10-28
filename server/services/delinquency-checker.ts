import { db } from "../db";
import { units, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";

/**
 * Delinquency Automation Service
 *
 * Eliminates need for external accountants like Juda Eskew
 * by automatically monitoring all 24 units and taking action
 */

export interface DelinquencyCheck {
  unitNumber: string;
  ownerName: string;
  email: string;
  totalOwed: number;
  daysDelinquent: number;
  currentStatus: string;
  recommendedAction: string;
  noticeType: "30_day" | "60_day" | "90_day" | "attorney" | null;
  isNewDelinquency: boolean;
}

/**
 * Calculate days delinquent based on balance owed
 * Assumes monthly maintenance is due on the 1st of each month
 */
function calculateDaysDelinquent(totalOwed: number, monthlyMaintenance: number): number {
  if (totalOwed === 0) return 0;

  // Estimate number of months behind
  const monthsBehind = Math.floor(totalOwed / monthlyMaintenance);

  // Each month = ~30 days
  return monthsBehind * 30;
}

/**
 * Determine what action should be taken based on delinquency status
 */
function determineAction(daysDelinquent: number, currentStatus: string, totalOwed: number): {
  recommendedAction: string;
  noticeType: "30_day" | "60_day" | "90_day" | "attorney" | null;
} {
  // Already with attorney
  if (currentStatus === "attorney") {
    return {
      recommendedAction: "Continue with attorney - No further board action needed",
      noticeType: null,
    };
  }

  // 90+ days - Send to attorney
  if (daysDelinquent >= 90) {
    return {
      recommendedAction: "URGENT: Refer to attorney immediately",
      noticeType: "attorney",
    };
  }

  // 60-89 days - Final warning
  if (daysDelinquent >= 60) {
    return {
      recommendedAction: "Send 90-day final notice before attorney",
      noticeType: "90_day",
    };
  }

  // 30-59 days - Second notice
  if (daysDelinquent >= 30) {
    return {
      recommendedAction: "Send 60-day notice with late fee warning",
      noticeType: "60_day",
    };
  }

  // 1-29 days - First notice
  if (daysDelinquent > 0) {
    return {
      recommendedAction: "Send 30-day courtesy reminder",
      noticeType: "30_day",
    };
  }

  return {
    recommendedAction: "Current - No action needed",
    noticeType: null,
  };
}

/**
 * Check all units for delinquency status
 * This runs daily via cron job
 */
export async function checkAllUnitsDelinquency(): Promise<DelinquencyCheck[]> {
  console.log("🔍 Running daily delinquency check...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // Get all units with financial data
    const allUnits = await db.select().from(units);

    const delinquencyChecks: DelinquencyCheck[] = [];
    let newDelinquencies = 0;
    let escalations = 0;

    for (const unit of allUnits) {
      const totalOwed = parseFloat(unit.totalOwed || "0");
      const monthlyMaintenance = parseFloat(unit.monthlyMaintenance || "350");
      const currentStatus = unit.delinquencyStatus || "current";
      const previousStatus = currentStatus; // In production, we'd store this in a history table

      // Skip if unit is current
      if (totalOwed === 0) {
        continue;
      }

      const daysDelinquent = calculateDaysDelinquent(totalOwed, monthlyMaintenance);
      const { recommendedAction, noticeType } = determineAction(daysDelinquent, currentStatus, totalOwed);

      // Determine if this is a new delinquency or escalation
      const isNewDelinquency = previousStatus === "current" && daysDelinquent > 0;
      const isEscalation = (previousStatus === "30-60days" && daysDelinquent >= 60) ||
                          (previousStatus === "90plus" && daysDelinquent >= 90);

      if (isNewDelinquency) newDelinquencies++;
      if (isEscalation) escalations++;

      delinquencyChecks.push({
        unitNumber: unit.unitNumber,
        ownerName: unit.ownerName,
        email: unit.email || "",
        totalOwed,
        daysDelinquent,
        currentStatus,
        recommendedAction,
        noticeType,
        isNewDelinquency: isNewDelinquency || isEscalation,
      });
    }

    console.log(`\n📊 Delinquency Check Summary:`);
    console.log(`   Total units checked: ${allUnits.length}`);
    console.log(`   Delinquent units: ${delinquencyChecks.length}`);
    console.log(`   New delinquencies: ${newDelinquencies}`);
    console.log(`   Escalations: ${escalations}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    return delinquencyChecks;

  } catch (error) {
    console.error("❌ Error checking delinquencies:", error);
    throw error;
  }
}

/**
 * Get units that need immediate action
 * Used for dashboard alerts
 */
export async function getUnitsNeedingAction(): Promise<DelinquencyCheck[]> {
  const allChecks = await checkAllUnitsDelinquency();

  // Filter to only units that need action (not current, not already with attorney)
  return allChecks.filter(check =>
    check.noticeType !== null &&
    check.currentStatus !== "attorney"
  );
}

/**
 * Get new delinquencies for board notification
 */
export async function getNewDelinquencies(): Promise<DelinquencyCheck[]> {
  const allChecks = await checkAllUnitsDelinquency();
  return allChecks.filter(check => check.isNewDelinquency);
}

/**
 * Auto-update delinquency status based on calculations
 * This ensures the database stays in sync
 */
export async function autoUpdateDelinquencyStatus(): Promise<void> {
  console.log("🔄 Auto-updating delinquency statuses...");

  try {
    const allUnits = await db.select().from(units);

    for (const unit of allUnits) {
      const totalOwed = parseFloat(unit.totalOwed || "0");
      const monthlyMaintenance = parseFloat(unit.monthlyMaintenance || "350");
      const daysDelinquent = calculateDaysDelinquent(totalOwed, monthlyMaintenance);

      // Determine new status
      let newStatus = "current";
      let newPriority = "low";

      if (daysDelinquent === 0) {
        newStatus = "current";
        newPriority = "low";
      } else if (daysDelinquent < 30) {
        newStatus = "pending";
        newPriority = "low";
      } else if (daysDelinquent < 60) {
        newStatus = "30-60days";
        newPriority = "medium";
      } else if (daysDelinquent < 90) {
        newStatus = "90plus";
        newPriority = "high";
      } else {
        newStatus = "attorney";
        newPriority = "attorney";
      }

      // Update if status changed
      if (unit.delinquencyStatus !== newStatus || unit.priorityLevel !== newPriority) {
        await db.update(units)
          .set({
            delinquencyStatus: newStatus,
            priorityLevel: newPriority,
          })
          .where(eq(units.id, unit.id));

        console.log(`   Updated Unit ${unit.unitNumber}: ${unit.delinquencyStatus} → ${newStatus}`);
      }
    }

    console.log("✅ Delinquency statuses updated\n");

  } catch (error) {
    console.error("❌ Error updating statuses:", error);
    throw error;
  }
}
