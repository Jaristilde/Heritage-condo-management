import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, verifyPassword, generateToken, authMiddleware, requireRole } from "./auth";
import { z } from "zod";
import { insertUserSchema, insertUnitSchema, insertPaymentSchema, insertVendorSchema, insertAssessmentSchema } from "@shared/schema";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
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

  const httpServer = createServer(app);

  return httpServer;
}
