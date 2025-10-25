import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, verifyPassword, generateToken, authMiddleware, requireRole } from "./auth";
import { z } from "zod";
import { insertUserSchema, insertUnitSchema, insertPaymentSchema, insertVendorSchema, insertAssessmentSchema } from "@shared/schema";
import Stripe from 'stripe';
import { generateMonthlyFinancialReport, type MonthlyReportData } from "./lib/pdfGenerator";
import { generateFinancialCommentary, type FinancialData } from "./lib/aiCommentary";
import { analyzeBudgetProposal } from "./lib/budgetAgent";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        unitId: user.unitId || undefined,
      });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          unitId: user.unitId,
        },
        token,
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        unitId: user.unitId || undefined,
      });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          unitId: user.unitId,
        },
        token,
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req, res) => {
    try {
      const userPayload = (req as any).user;
      const user = await storage.getUser(userPayload.userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        unitId: user.unitId,
      });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Unit routes
  app.get("/api/units", authMiddleware, async (req, res) => {
    try {
      const userPayload = (req as any).user;
      
      if (userPayload.role === 'owner' && userPayload.unitId) {
        const unit = await storage.getUnit(userPayload.unitId);
        return res.json([unit]);
      }

      const units = await storage.getAllUnits();
      res.json(units);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/units/:id", authMiddleware, async (req, res) => {
    try {
      const unit = await storage.getUnit(req.params.id);
      
      if (!unit) {
        return res.status(404).json({ error: "Unit not found" });
      }

      const userPayload = (req as any).user;
      if (userPayload.role === 'owner' && userPayload.unitId !== unit.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      res.json(unit);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/units", authMiddleware, requireRole('board', 'management'), async (req, res) => {
    try {
      const data = insertUnitSchema.parse(req.body);
      const unit = await storage.createUnit(data);
      res.json(unit);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.patch("/api/units/:id", authMiddleware, requireRole('board', 'management'), async (req, res) => {
    try {
      const unit = await storage.updateUnit(req.params.id, req.body);
      
      if (!unit) {
        return res.status(404).json({ error: "Unit not found" });
      }

      res.json(unit);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Owner routes
  app.get("/api/units/:unitId/owners", authMiddleware, async (req, res) => {
    try {
      const owners = await storage.getOwnersByUnit(req.params.unitId);
      res.json(owners);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Payment routes
  app.get("/api/payments", authMiddleware, requireRole('board', 'management'), async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/units/:unitId/payments", authMiddleware, async (req, res) => {
    try {
      const userPayload = (req as any).user;
      
      if (userPayload.role === 'owner' && userPayload.unitId !== req.params.unitId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const payments = await storage.getPaymentsByUnit(req.params.unitId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/payments", authMiddleware, async (req, res) => {
    try {
      const data = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(data);
      
      const unit = await storage.getUnit(payment.unitId);
      if (unit) {
        const newBalance = parseFloat(unit.totalOwed) - parseFloat(payment.amount);
        await storage.updateUnit(unit.id, {
          totalOwed: newBalance.toFixed(2),
        });
      }

      res.json(payment);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Stripe payment intent
  app.post("/api/stripe/create-payment-intent", authMiddleware, async (req, res) => {
    try {
      const { amount, unitId } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          unitId,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  // Payment plan routes
  app.get("/api/units/:unitId/payment-plans", authMiddleware, async (req, res) => {
    try {
      const plans = await storage.getPaymentPlansByUnit(req.params.unitId);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Assessment routes
  app.get("/api/assessments", authMiddleware, async (req, res) => {
    try {
      const assessments = await storage.getAllAssessments();
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/assessments", authMiddleware, requireRole('board', 'management'), async (req, res) => {
    try {
      const data = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(data);
      res.json(assessment);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Vendor routes
  app.get("/api/vendors", authMiddleware, requireRole('board', 'management'), async (req, res) => {
    try {
      const vendors = await storage.getAllVendors();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/vendors", authMiddleware, requireRole('board', 'management'), async (req, res) => {
    try {
      const data = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(data);
      res.json(vendor);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.get("/api/vendors/:id", authMiddleware, requireRole('board', 'management'), async (req, res) => {
    try {
      const vendor = await storage.getVendor(req.params.id);
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.patch("/api/vendors/:id", authMiddleware, requireRole('board', 'management'), async (req, res) => {
    try {
      const vendor = await storage.updateVendor(req.params.id, req.body);
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.delete("/api/vendors/:id", authMiddleware, requireRole('board'), async (req, res) => {
    try {
      await storage.deleteVendor(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Vendor Invoice routes
  app.get("/api/vendor-invoices", authMiddleware, requireRole('board', 'management'), async (req, res) => {
    try {
      const { status, vendorId } = req.query;
      let invoices;
      
      if (status) {
        invoices = await storage.getVendorInvoicesByStatus(status as string);
      } else if (vendorId) {
        invoices = await storage.getVendorInvoicesByVendor(vendorId as string);
      } else {
        invoices = await storage.getAllVendorInvoices();
      }
      
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/vendor-invoices/:id", authMiddleware, requireRole('board', 'management'), async (req, res) => {
    try {
      const invoice = await storage.getVendorInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/vendor-invoices", authMiddleware, requireRole('board', 'management'), async (req, res) => {
    try {
      const userPayload = (req as any).user;
      const data = {
        ...req.body,
        uploadedBy: userPayload.userId,
      };
      const invoice = await storage.createVendorInvoice(data);
      res.json(invoice);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.patch("/api/vendor-invoices/:id", authMiddleware, requireRole('board', 'management'), async (req, res) => {
    try {
      const invoice = await storage.updateVendorInvoice(req.params.id, req.body);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.delete("/api/vendor-invoices/:id", authMiddleware, requireRole('board'), async (req, res) => {
    try {
      await storage.deleteVendorInvoice(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Dashboard statistics
  app.get("/api/dashboard/stats", authMiddleware, requireRole('board', 'management'), async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Board action routes
  app.get("/api/board-actions", authMiddleware, requireRole('board', 'management'), async (req, res) => {
    try {
      const actions = await storage.getAllBoardActions();
      res.json(actions);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Notification routes
  app.get("/api/notifications", authMiddleware, async (req, res) => {
    try {
      const userPayload = (req as any).user;
      const notifications = await storage.getNotificationsByUser(userPayload.userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.patch("/api/notifications/:id/read", authMiddleware, async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Financial Report Generation
  app.post("/api/reports/generate", authMiddleware, requireRole('board', 'management'), async (req, res) => {
    try {
      const userPayload = (req as any).user;
      const { month, year } = req.body;

      if (!month || !year) {
        return res.status(400).json({ error: "Month and year are required" });
      }

      const allUnits = await storage.getAllUnits();
      const allPayments = await storage.getAllPayments();
      const allVendors = await storage.getAllVendors();

      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      
      const monthPayments = allPayments.filter(p => {
        const paidDate = new Date(p.paidAt);
        return paidDate >= monthStart && paidDate <= monthEnd;
      });

      const maintenanceFees = monthPayments
        .filter(p => p.paymentType === 'maintenance')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      const firstAssessment = monthPayments
        .filter(p => p.paymentType === 'first_assessment')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      const secondAssessment = monthPayments
        .filter(p => p.paymentType === 'second_assessment')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      const lateFees = monthPayments
        .filter(p => p.paymentType === 'late_fee')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

      const totalRevenue = maintenanceFees + firstAssessment + secondAssessment + lateFees;

      const expenseCategories = [
        { category: "Property Insurance", actual: 4200, budget: 4000, variance: 200, variancePercent: 5 },
        { category: "Management Fees", actual: 2000, budget: 2000, variance: 0, variancePercent: 0 },
        { category: "Utilities - Water/Sewer", actual: 1850, budget: 1800, variance: 50, variancePercent: 2.8 },
        { category: "Utilities - Electricity", actual: 1200, budget: 1250, variance: -50, variancePercent: -4 },
        { category: "Elevator Maintenance", actual: 950, budget: 900, variance: 50, variancePercent: 5.6 },
        { category: "Landscaping", actual: 800, budget: 750, variance: 50, variancePercent: 6.7 },
        { category: "Pool Service", actual: 400, budget: 400, variance: 0, variancePercent: 0 },
        { category: "Loan Payment", actual: 1800, budget: 1800, variance: 0, variancePercent: 0 },
      ];

      const totalExpenses = expenseCategories.reduce((sum, e) => sum + e.actual, 0);
      const netIncome = totalRevenue - totalExpenses;

      const delinquentUnits = allUnits.filter(u => parseFloat(u.totalOwed) > 0);
      
      const delinquencies = delinquentUnits.map(u => ({
        unitNumber: u.unitNumber,
        ownerName: `Owner ${u.unitNumber}`,
        maintenanceBalance: parseFloat(u.maintenanceBalance),
        firstAssessmentBalance: parseFloat(u.firstAssessmentBalance),
        secondAssessmentBalance: parseFloat(u.secondAssessmentBalance),
        totalOwed: parseFloat(u.totalOwed),
        status: u.delinquencyStatus,
        daysPastDue: u.delinquencyStatus === '30-60days' ? 45 : u.delinquencyStatus === '90plus' ? 120 : u.delinquencyStatus === 'attorney' ? 180 : 0,
      }));

      const totalPossibleRevenue = allUnits.reduce((sum, u) => sum + parseFloat(u.monthlyMaintenance), 0);
      const collectionRate = totalPossibleRevenue > 0 ? (maintenanceFees / totalPossibleRevenue) * 100 : 0;

      const aiCommentaryData: FinancialData = {
        month,
        year,
        netIncome,
        totalRevenue,
        totalExpenses,
        collectionRate,
        unitsInArrears: delinquentUnits.length,
        totalCash: 286584,
        operatingCash: 136584,
        reserveCash: 150000,
        maintenanceCollected: maintenanceFees,
        maintenanceBudget: totalPossibleRevenue,
        assessmentCollected: firstAssessment + secondAssessment,
        lateFees,
        topExpenses: expenseCategories.slice(0, 5),
        delinquencyDetails: delinquencies.slice(0, 5).map(d => ({
          unitNumber: d.unitNumber,
          amount: d.totalOwed,
          status: d.status,
        })),
      };

      const aiCommentary = await generateFinancialCommentary(aiCommentaryData);

      const reportData: MonthlyReportData = {
        month,
        year,
        reportDate: new Date(),
        balanceSheet: {
          assets: {
            operatingCash: 136584,
            reserveCash: 150000,
            specialAssessmentCash: 0,
            debtServiceCash: 0,
            accountsReceivable: delinquentUnits.reduce((sum, u) => sum + parseFloat(u.totalOwed), 0),
            prepaidExpenses: 2500,
          },
          liabilities: {
            accountsPayable: 3200,
            accruedExpenses: 1800,
            deferredRevenue: 0,
            loanPayable: 125000,
          },
          equity: {
            reserveFund: 150000,
            operatingFund: 50000,
            retainedEarnings: 86584,
          },
        },
        incomeStatement: {
          revenue: {
            maintenanceFees,
            firstAssessment,
            secondAssessment,
            lateFees,
            interestIncome: 45,
            other: 0,
          },
          expenses: expenseCategories,
          netIncome,
        },
        delinquencies,
        cashFlow: {
          operatingActivities: {
            netIncome,
            accountsReceivableChange: -500,
            accountsPayableChange: 300,
            netCashFromOperations: netIncome - 200,
          },
          investingActivities: {
            capitalImprovements: -2000,
            netCashFromInvesting: -2000,
          },
          financingActivities: {
            loanProceeds: 0,
            loanRepayments: -1800,
            netCashFromFinancing: -1800,
          },
          netCashChange: netIncome - 200 - 2000 - 1800,
          beginningCash: 282584,
          endingCash: 286584,
        },
        bankReconciliation: [
          {
            accountName: "Popular Bank - Operating (1343)",
            bankBalance: 136984,
            outstandingChecks: [
              { checkNumber: "1025", amount: 400, payee: "ABC Landscaping" },
            ],
            depositsInTransit: 0,
            bookBalance: 136584,
            difference: 0,
          },
          {
            accountName: "Truist Bank - Reserve (5602)",
            bankBalance: 150000,
            outstandingChecks: [],
            depositsInTransit: 0,
            bookBalance: 150000,
            difference: 0,
          },
        ],
        aiCommentary,
        collectionRate,
        unitsInArrears: delinquentUnits.length,
        totalCash: 286584,
      };

      const pdfBuffer = await generateMonthlyFinancialReport(reportData);

      const filename = `Heritage_Financial_Report_${year}_${month.toString().padStart(2, '0')}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);

    } catch (error) {
      console.error("Error generating financial report:", error);
      res.status(500).json({ error: "Failed to generate financial report" });
    }
  });

  // Budget Proposal Generation
  app.post("/api/budget/propose", authMiddleware, requireRole('board', 'management'), async (req, res) => {
    try {
      const userPayload = (req as any).user;
      const { targetYear } = req.body;

      if (!targetYear) {
        return res.status(400).json({ error: "Target year is required" });
      }

      const proposal = await analyzeBudgetProposal(targetYear, userPayload.userId);

      res.json(proposal);

    } catch (error) {
      console.error("Error generating budget proposal:", error);
      res.status(500).json({ error: "Failed to generate budget proposal" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
