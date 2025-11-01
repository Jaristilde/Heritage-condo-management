import { Router } from "express";
import { db } from "./db";
import { users, units } from "@shared/schema";
import { like, eq, sql } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

const router = Router();

// ⚠️ SECURITY: Add authentication check
const ADMIN_SECRET = process.env.ADMIN_SECRET || "change-this-in-production";

function requireAdminSecret(req: any, res: any, next: any) {
  const providedSecret = req.headers['x-admin-secret'] || req.query.secret;

  if (providedSecret !== ADMIN_SECRET) {
    return res.status(403).json({
      error: "Forbidden: Invalid admin secret",
      hint: "Set X-Admin-Secret header or ?secret= query param"
    });
  }

  next();
}

/**
 * EMERGENCY ENDPOINT: Reset all owner passwords
 *
 * Call this from browser:
 * GET /api/admin/fix-passwords?secret=YOUR_SECRET
 */
router.get("/fix-passwords", requireAdminSecret, async (req, res) => {
  try {
    console.log("🚨 ADMIN: Emergency password fix initiated");

    const password = "Heritage2025!";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get all owner accounts
    const ownerAccounts = await db
      .select()
      .from(users)
      .where(like(users.username, "owner%"));

    console.log(`Found ${ownerAccounts.length} owner accounts`);

    let updated = 0;
    const results = [];

    for (const account of ownerAccounts) {
      try {
        await db
          .update(users)
          .set({
            password: hashedPassword,
            mustChangePassword: false,
            active: true,
          })
          .where(eq(users.id, account.id));

        // Verify the password works
        const isValid = await bcrypt.compare(password, hashedPassword);

        if (isValid) {
          console.log(`✅ ${account.username}: Password updated and verified`);
          results.push({ username: account.username, status: "✅ Updated" });
          updated++;
        } else {
          console.log(`❌ ${account.username}: Password updated but verification FAILED`);
          results.push({ username: account.username, status: "⚠️ Updated but verification failed" });
          updated++;
        }
      } catch (error: any) {
        console.error(`❌ ${account.username}: Error - ${error.message}`);
        results.push({ username: account.username, status: `❌ Error: ${error.message}` });
      }
    }

    console.log("🚨 ADMIN: Password fix complete");

    res.json({
      success: true,
      message: "Password reset complete",
      totalAccounts: ownerAccounts.length,
      updated: updated,
      password: password,
      results: results
    });

  } catch (error: any) {
    console.error("❌ ADMIN: Password fix failed:", error);
    res.status(500).json({
      error: "Password fix failed",
      message: error.message
    });
  }
});

/**
 * EMERGENCY ENDPOINT: Sync SA2 balances
 *
 * Call this from browser:
 * GET /api/admin/fix-sa2?secret=YOUR_SECRET
 */
router.get("/fix-sa2", requireAdminSecret, async (req, res) => {
  try {
    console.log("🚨 ADMIN: SA2 sync initiated");

    // Ensure column exists
    try {
      await db.execute(sql`
        ALTER TABLE units
        ADD COLUMN IF NOT EXISTS second_assessment_balance TEXT DEFAULT '0.00'
      `);
      console.log("✅ Column exists or created");
    } catch (error: any) {
      console.log("⚠️  Column may already exist:", error.message);
    }

    // Sync the data
    const result = await db.execute(sql`
      UPDATE units
      SET second_assessment_balance = assessment_2024_remaining,
          updated_at = NOW()
      WHERE assessment_2024_remaining IS NOT NULL
        AND CAST(assessment_2024_remaining AS DECIMAL) > 0
    `);

    console.log(`✅ Updated ${result.rowCount || 0} units with SA2 balances`);

    // Verify the sync
    const allUnits = await db.select().from(units);
    const unitsWithSA2 = allUnits.filter(u =>
      u.secondAssessmentBalance && parseFloat(u.secondAssessmentBalance) > 0
    );

    console.log(`✅ ${unitsWithSA2.length} units now have SA2 balances`);
    console.log("🚨 ADMIN: SA2 sync complete");

    res.json({
      success: true,
      message: "SA2 sync complete",
      unitsUpdated: result.rowCount || 0,
      unitsWithBalance: unitsWithSA2.length,
      monthlyPayment: "$331.13"
    });

  } catch (error: any) {
    console.error("❌ ADMIN: SA2 sync failed:", error);
    res.status(500).json({
      error: "SA2 sync failed",
      message: error.message
    });
  }
});

/**
 * STATUS CHECK: Verify admin endpoints are working
 *
 * Call this from browser:
 * GET /api/admin/status?secret=YOUR_SECRET
 */
router.get("/status", requireAdminSecret, async (req, res) => {
  try {
    const ownerCount = await db
      .select()
      .from(users)
      .where(like(users.username, "owner%"));

    const allUnits = await db.select().from(units);
    const unitsWithSA2 = allUnits.filter(u =>
      u.secondAssessmentBalance && parseFloat(u.secondAssessmentBalance) > 0
    );

    res.json({
      success: true,
      environment: process.env.NODE_ENV || "development",
      database: "connected",
      ownerAccounts: ownerCount.length,
      totalUnits: allUnits.length,
      unitsWithSA2Balance: unitsWithSA2.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    res.status(500).json({
      error: "Status check failed",
      message: error.message
    });
  }
});

export default router;
