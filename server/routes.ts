import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, verifyPassword, generateToken, authMiddleware, requireRole } from "./auth";
import { uploadInvoice, uploadDocument } from "./middleware/upload";
import { z } from "zod";
import {
  insertUserSchema,
  insertUnitSchema,
  insertPaymentSchema,
  insertVendorSchema,
  insertAssessmentSchema,
  insertInvoiceSchema,
  insertLedgerEntrySchema
} from "@shared/schema";
import Stripe from 'stripe';
import { generateMonthlyFinancialReport, type MonthlyReportData } from "./lib/pdfGenerator";
import { generateFinancialCommentary, type FinancialData } from "./lib/aiCommentary";
import { analyzeBudgetProposal } from "./lib/budgetAgent";
import {
  exportInvoicesToIIF,
  exportInvoicesToCSV,
  exportPaymentsToIIF,
  exportPaymentsToCSV,
  exportChartOfAccountsToIIF
} from "./lib/quickbooksExport";

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

  // Owner registration endpoint
  app.post("/api/auth/register/owner", async (req, res) => {
    try {
      const { unitNumber, ownerName, email, phone, username, password } = req.body;

      // Validate required fields
      if (!unitNumber || !ownerName || !email || !phone || !username || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Find the unit by unit number
      const units = await storage.getUnits();
      const unit = units.find((u: any) => u.unitNumber === unitNumber);

      if (!unit) {
        return res.status(400).json({ error: "Invalid unit number" });
      }

      // Check if unit already has an owner account registered
      const existingOwner = await storage.getUserByUnitId(unit.id);
      if (existingOwner) {
        return res.status(400).json({ error: "This unit already has a registered owner" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        role: "owner",
        unitId: unit.id,
      });

      // Update unit with owner information
      await storage.updateUnit(unit.id, {
        ownerName,
        ownerEmail: email,
        ownerPhone: phone,
      });

      // Don't auto-login, just return success
      res.json({
        success: true,
        message: "Registration successful. Please login with your credentials.",
      });
    } catch (error: any) {
      console.error("Owner registration error:", error);
      res.status(500).json({ error: error.message || "Registration failed" });
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
          mustChangePassword: user.mustChangePassword || false,
        },
        token,
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.post("/api/auth/change-password-required", authMiddleware, async (req, res) => {
    try {
      const userPayload = (req as any).user;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Get current user
      const user = await storage.getUser(userPayload.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user actually needs to change password
      if (!user.mustChangePassword) {
        return res.status(400).json({ error: "Password change not required" });
      }

      // Verify current password
      const isValid = await verifyPassword(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Validate new passwords match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "New passwords do not match" });
      }

      // Validate new password strength
      if (newPassword.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }
      if (!/[a-z]/.test(newPassword)) {
        return res.status(400).json({ error: "Password must contain at least one lowercase letter" });
      }
      if (!/[A-Z]/.test(newPassword)) {
        return res.status(400).json({ error: "Password must contain at least one uppercase letter" });
      }
      if (!/[0-9]/.test(newPassword)) {
        return res.status(400).json({ error: "Password must contain at least one number" });
      }

      // Hash and update new password, clear mustChangePassword flag
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(userPayload.userId, {
        password: hashedPassword,
        mustChangePassword: false,
      });

      res.json({ success: true, message: "Password changed successfully" });
    } catch (error: any) {
      console.error("Required password change error:", error);
      res.status(500).json({ error: error.message || "Failed to change password" });
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

  // Profile management routes
  app.put("/api/profile", authMiddleware, async (req, res) => {
    try {
      const userPayload = (req as any).user;
      const { ownerName, email, phone } = req.body;

      // Update user email
      if (email) {
        await storage.updateUser(userPayload.userId, { email });
      }

      // Update unit owner information if user is an owner
      if (userPayload.role === "owner" && userPayload.unitId) {
        await storage.updateUnit(userPayload.unitId, {
          ownerName,
          ownerEmail: email,
          ownerPhone: phone,
        });
      }

      res.json({ success: true, message: "Profile updated successfully" });
    } catch (error: any) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: error.message || "Failed to update profile" });
    }
  });

  app.put("/api/profile/password", authMiddleware, async (req, res) => {
    try {
      const userPayload = (req as any).user;
      const { currentPassword, newPassword } = req.body;

      // Get current user
      const user = await storage.getUser(userPayload.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify current password
      const isValid = await verifyPassword(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Validate new password
      if (newPassword.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      // Hash and update new password
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(userPayload.userId, { password: hashedPassword });

      res.json({ success: true, message: "Password updated successfully" });
    } catch (error: any) {
      console.error("Password change error:", error);
      res.status(500).json({ error: error.message || "Failed to change password" });
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

  app.post("/api/units", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const data = insertUnitSchema.parse(req.body);
      const unit = await storage.createUnit(data);
      res.json(unit);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.patch("/api/units/:id", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
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
  app.get("/api/payments", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
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

  app.post("/api/assessments", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const data = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(data);
      res.json(assessment);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Vendor routes
  app.get("/api/vendors", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const vendors = await storage.getAllVendors();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/vendors", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const data = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(data);
      res.json(vendor);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.get("/api/vendors/:id", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
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

  app.patch("/api/vendors/:id", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
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

  app.delete("/api/vendors/:id", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member'), async (req, res) => {
    try {
      await storage.deleteVendor(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const { status, vendorId, startDate, endDate } = req.query;

      // Get invoices with filters
      const invoices = await storage.getInvoicesWithFilters({
        status: status as string,
        vendorId: vendorId as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/invoices/:id", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/invoices", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const userPayload = (req as any).user;
      const data = insertInvoiceSchema.parse({
        ...req.body,
        uploadedBy: userPayload.userId,
      });
      const invoice = await storage.createInvoice(data);

      // Send notifications to board members for invoice approval
      if (invoice.status === 'pending') {
        try {
          const allUsers = await storage.getAllUsers();
          const boardMembers = allUsers.filter((u: any) =>
            u.role === 'board_secretary' ||
            u.role === 'board_treasurer' ||
            u.role === 'board_member'
          );

          // Get vendor name for notification
          const vendor = await storage.getVendor(invoice.vendorId);
          const vendorName = vendor?.vendorName || 'Unknown Vendor';

          // Create notifications for each board member
          for (const boardMember of boardMembers) {
            await storage.createNotification({
              userId: boardMember.id,
              notificationType: 'board_action',
              title: 'New Invoice Awaiting Approval',
              message: `A new invoice from ${vendorName} for $${invoice.amount} has been uploaded and requires your approval.`,
              isRead: false,
            });
          }

          console.log(`✅ Notified ${boardMembers.length} board members about new invoice`);
        } catch (notificationError) {
          console.error('Failed to send notifications:', notificationError);
          // Don't fail the request if notifications fail
        }
      }

      res.json(invoice);
    } catch (error) {
      console.error('Create invoice error:', error);
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.put("/api/invoices/:id", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const invoice = await storage.updateInvoice(req.params.id, req.body);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.delete("/api/invoices/:id", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member'), async (req, res) => {
    try {
      await storage.deleteInvoice(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Invoice file upload (for new invoices - before creation)
  app.post("/api/invoices/upload-file", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), uploadInvoice.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = `/uploads/invoices/${req.file.filename}`;
      res.json({ fileUrl, fileName: req.file.originalname });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Invoice file upload (for existing invoices)
  app.post("/api/invoices/:id/upload", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), uploadInvoice.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = `/uploads/invoices/${req.file.filename}`;
      const invoice = await storage.updateInvoice(req.params.id, {
        fileUrl,
        fileName: req.file.originalname,
      });

      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      res.json({ fileUrl, fileName: req.file.originalname });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Approve invoice
  // Approve invoice - BOARD MEMBERS ONLY (not management)
  app.post("/api/invoices/:id/approve", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member'), async (req, res) => {
    try {
      const userPayload = (req as any).user;
      const invoice = await storage.updateInvoice(req.params.id, {
        status: 'approved',
        approvedBy: userPayload.userId,
        approvedAt: new Date().toISOString(),
      });

      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Reject invoice - BOARD MEMBERS ONLY (not management)
  app.post("/api/invoices/:id/reject", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member'), async (req, res) => {
    try {
      const userPayload = (req as any).user;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ error: "Rejection reason is required" });
      }

      const invoice = await storage.updateInvoice(req.params.id, {
        status: 'rejected',
        rejectedBy: userPayload.userId,
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason,
      });

      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Bulk approve invoices - BOARD MEMBERS ONLY (not management)
  app.post("/api/invoices/bulk-approve", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member'), async (req, res) => {
    try {
      const userPayload = (req as any).user;
      const { invoiceIds } = req.body;

      if (!invoiceIds || !Array.isArray(invoiceIds)) {
        return res.status(400).json({ error: "Invoice IDs array is required" });
      }

      const results = await Promise.all(
        invoiceIds.map(id =>
          storage.updateInvoice(id, {
            status: 'approved',
            approvedBy: userPayload.userId,
            approvedAt: new Date().toISOString(),
          })
        )
      );

      const approved = results.filter(r => r !== undefined).length;
      res.json({ approved, total: invoiceIds.length });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Ledger routes
  app.get("/api/units/:id/ledger", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const ledgerEntries = await storage.getLedgerEntriesByUnit(req.params.id);
      res.json(ledgerEntries);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Dashboard statistics
  app.get("/api/dashboard/stats", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Board action routes
  app.get("/api/board-actions", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
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

  // Document Management Routes
  app.get("/api/documents", authMiddleware, async (req, res) => {
    try {
      const { relatedTo, relatedId } = req.query;
      const documents = await storage.getDocuments(
        relatedTo as string | undefined,
        relatedId as string | undefined
      );
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/documents/upload", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), uploadDocument.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const userPayload = (req as any).user;
      const { fileType, relatedTo, relatedId } = req.body;

      if (!fileType) {
        return res.status(400).json({ error: "Document type is required" });
      }

      const fileUrl = `/uploads/documents/${req.file.filename}`;

      const document = await storage.createDocument({
        fileName: req.file.originalname,
        fileUrl,
        fileType,
        uploadedBy: userPayload.userId,
        relatedTo: relatedTo || null,
        relatedId: relatedId || null,
      });

      console.log(`✅ Document uploaded: ${req.file.originalname} (${fileType})`);
      res.json(document);
    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Financial Report Generation
  app.post("/api/reports/generate", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
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
  app.post("/api/budget/propose", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
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

  // ============================================
  // COMPREHENSIVE FINANCIAL REPORTS
  // All 5 report types for board self-sufficiency
  // ============================================

  // Get comprehensive financial report data (all 5 reports)
  app.get("/api/reports/full", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({ error: "Month and year are required" });
      }

      const allUnits = await storage.getAllUnits();
      const allPayments = await storage.getAllPayments();

      const monthNum = parseInt(month as string);
      const yearNum = parseInt(year as string);

      const monthStart = new Date(yearNum, monthNum - 1, 1);
      const monthEnd = new Date(yearNum, monthNum, 0);

      const monthPayments = allPayments.filter(p => {
        const paidDate = new Date(p.paidAt);
        return paidDate >= monthStart && paidDate <= monthEnd;
      });

      // Calculate revenues
      const maintenanceFees = monthPayments
        .filter(p => p.paymentType === 'maintenance')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

      const reserveAssessments = monthPayments
        .filter(p => p.paymentType === 'reserve_assessment')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

      const specialAssessments = monthPayments
        .filter(p => p.paymentType === 'first_assessment' || p.paymentType === 'second_assessment')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

      const lateFees = monthPayments
        .filter(p => p.paymentType === 'late_fee')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

      const totalRevenue = maintenanceFees + reserveAssessments + specialAssessments + lateFees;

      // Calculate expenses (using static data for now)
      const expenses = [
        { category: "Property Insurance", amount: 4200, budget: 4000, variance: 5.0 },
        { category: "Management Fees", amount: 2000, budget: 2000, variance: 0 },
        { category: "Utilities - Water/Sewer", amount: 1850, budget: 1800, variance: 2.8 },
        { category: "Utilities - Electricity", amount: 1200, budget: 1250, variance: -4.0 },
        { category: "Elevator Maintenance", amount: 950, budget: 900, variance: 5.6 },
        { category: "Landscaping", amount: 800, budget: 750, variance: 6.7 },
        { category: "Pool Service", amount: 400, budget: 400, variance: 0 },
        { category: "Loan Payment", amount: 1800, budget: 1800, variance: 0 },
      ];

      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const netIncome = totalRevenue - totalExpenses;

      // Delinquent units
      const delinquentUnits = allUnits.filter(u => parseFloat(u.totalOwed) > 0);
      const totalDelinquent = delinquentUnits.reduce((sum, u) => sum + parseFloat(u.totalOwed), 0);

      // Calculate aging buckets
      const aging = {
        current: 0,
        days0to30: 0,
        days31to60: 0,
        days61to90: 0,
        days90plus: 0,
      };

      delinquentUnits.forEach(unit => {
        const owed = parseFloat(unit.totalOwed);
        const status = unit.delinquencyStatus;

        if (status === 'pending') aging.days0to30 += owed;
        else if (status === '30-60days') aging.days31to60 += owed;
        else if (status === '90plus') aging.days61to90 += owed;
        else if (status === 'attorney') aging.days90plus += owed;
      });

      // Collection rates (24 units)
      const maintenanceExpected = 24 * 436.62; // $436.62/month
      const reserveExpected = 24 * 37.50; // $37.50/month
      const specialExpected = 24 * 66.66; // $66.66/month

      const maintenanceRate = (maintenanceFees / maintenanceExpected) * 100;
      const reserveRate = (reserveAssessments / reserveExpected) * 100;
      const specialRate = (specialAssessments / specialExpected) * 100;
      const overallRate = ((maintenanceFees + reserveAssessments + specialAssessments) / (maintenanceExpected + reserveExpected + specialExpected)) * 100;

      // Budget data
      const budgetCategories = expenses.map(e => ({
        category: e.category,
        budget: e.budget,
        actual: e.amount,
        variance: e.amount - e.budget,
        variancePercent: ((e.amount - e.budget) / e.budget) * 100,
        status: e.amount > e.budget * 1.1 ? "over" as const : e.amount < e.budget * 0.9 ? "under" as const : "on-track" as const,
      }));

      const totalBudget = expenses.reduce((sum, e) => sum + e.budget, 0);
      const totalActual = totalExpenses;
      const totalVariance = totalActual - totalBudget;
      const variancePercent = (totalVariance / totalBudget) * 100;

      // Compile full report
      const reportData = {
        month: monthNum,
        year: yearNum,
        reportDate: new Date().toISOString(),

        balanceSheet: {
          assets: {
            operatingCash: 136584,
            reserveCash: 150000,
            accountsReceivable: totalDelinquent,
            totalAssets: 136584 + 150000 + totalDelinquent + 2500,
          },
          liabilities: {
            accountsPayable: 3200,
            deferredRevenue: 0,
            totalLiabilities: 3200,
          },
          equity: {
            reserveFund: 150000,
            operatingFund: 50000,
            totalEquity: 200000,
          },
        },

        incomeStatement: {
          revenue: {
            maintenanceFees,
            reserveAssessments,
            specialAssessments,
            lateFees,
            totalRevenue,
          },
          expenses,
          totalExpenses,
          netIncome,
        },

        delinquencyReport: {
          totalDelinquent,
          totalUnitsDelinquent: delinquentUnits.length,
          aging,
          units: delinquentUnits.map(u => ({
            unitNumber: u.unitNumber,
            ownerName: u.ownerName || `Owner ${u.unitNumber}`,
            totalOwed: parseFloat(u.totalOwed),
            daysDelinquent: u.delinquencyStatus === '30-60days' ? 45 : u.delinquencyStatus === '90plus' ? 120 : u.delinquencyStatus === 'attorney' ? 180 : 15,
            status: u.delinquencyStatus,
          })),
        },

        collectionReport: {
          maintenance: {
            expected: maintenanceExpected,
            collected: maintenanceFees,
            rate: maintenanceRate,
          },
          reserve: {
            expected: reserveExpected,
            collected: reserveAssessments,
            rate: reserveRate,
          },
          special: {
            expected: specialExpected,
            collected: specialAssessments,
            rate: specialRate,
          },
          overall: {
            expected: maintenanceExpected + reserveExpected + specialExpected,
            collected: maintenanceFees + reserveAssessments + specialAssessments,
            rate: overallRate,
          },
        },

        budgetReport: {
          totalBudget,
          totalActual,
          totalVariance,
          variancePercent,
          categories: budgetCategories,
        },
      };

      res.json(reportData);

    } catch (error) {
      console.error("Error generating comprehensive report:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  // Export specific report to PDF
  app.post("/api/reports/export/pdf", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const { reportType, month, year } = req.body;

      if (!reportType || !month || !year) {
        return res.status(400).json({ error: "Report type, month, and year are required" });
      }

      // For now, return a simple message
      // In production, you would generate actual PDFs using jsPDF
      res.json({
        success: true,
        message: `PDF generation for ${reportType} coming soon`,
        reportType,
        month,
        year,
      });

    } catch (error) {
      console.error("Error exporting PDF:", error);
      res.status(500).json({ error: "Failed to export PDF" });
    }
  });

  // ============================================
  // QUICKBOOKS EXPORT ENDPOINTS
  // Export financial data to QuickBooks Desktop (IIF) or Online (CSV)
  // ============================================

  // Export invoices to IIF format (QuickBooks Desktop)
  app.get("/api/quickbooks/export/invoices/iif", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const { startDate, endDate, status } = req.query;

      // Build query filters
      const filters: any = {};
      if (status) filters.status = status as string;
      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;

      // Get invoices from database
      let query = db.select().from(invoices);

      if (startDate || endDate || status) {
        const conditions = [];
        if (status) conditions.push(eq(invoices.status, status as string));
        if (startDate) conditions.push(gte(invoices.invoiceDate, startDate as string));
        if (endDate) conditions.push(lte(invoices.invoiceDate, endDate as string));
        query = query.where(and(...conditions));
      }

      const invoiceList = await query;

      // Convert to export format
      const iifContent = exportInvoicesToIIF(invoiceList);

      res.setHeader('Content-Type', 'application/x-intuit-interchange');
      res.setHeader('Content-Disposition', 'attachment; filename="invoices.iif"');
      res.send(iifContent);
    } catch (error) {
      console.error("Error exporting invoices to IIF:", error);
      res.status(500).json({ error: "Failed to export invoices to IIF format" });
    }
  });

  // Export invoices to CSV format (QuickBooks Online)
  app.get("/api/quickbooks/export/invoices/csv", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const { startDate, endDate, status } = req.query;

      // Build query filters
      let query = db.select().from(invoices);

      if (startDate || endDate || status) {
        const conditions = [];
        if (status) conditions.push(eq(invoices.status, status as string));
        if (startDate) conditions.push(gte(invoices.invoiceDate, startDate as string));
        if (endDate) conditions.push(lte(invoices.invoiceDate, endDate as string));
        query = query.where(and(...conditions));
      }

      const invoiceList = await query;

      // Convert to CSV format
      const csvContent = exportInvoicesToCSV(invoiceList);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="invoices.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting invoices to CSV:", error);
      res.status(500).json({ error: "Failed to export invoices to CSV format" });
    }
  });

  // Export payments to IIF format (QuickBooks Desktop)
  app.get("/api/quickbooks/export/payments/iif", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const { startDate, endDate, paymentType } = req.query;

      // Build query filters
      let query = db.select().from(payments);

      if (startDate || endDate || paymentType) {
        const conditions = [];
        if (paymentType) conditions.push(eq(payments.paymentType, paymentType as string));
        if (startDate) conditions.push(gte(payments.paidAt, startDate as string));
        if (endDate) conditions.push(lte(payments.paidAt, endDate as string));
        query = query.where(and(...conditions));
      }

      const paymentList = await query;

      // Convert to IIF format
      const iifContent = exportPaymentsToIIF(paymentList);

      res.setHeader('Content-Type', 'application/x-intuit-interchange');
      res.setHeader('Content-Disposition', 'attachment; filename="payments.iif"');
      res.send(iifContent);
    } catch (error) {
      console.error("Error exporting payments to IIF:", error);
      res.status(500).json({ error: "Failed to export payments to IIF format" });
    }
  });

  // Export payments to CSV format (QuickBooks Online)
  app.get("/api/quickbooks/export/payments/csv", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const { startDate, endDate, paymentType } = req.query;

      // Build query filters
      let query = db.select().from(payments);

      if (startDate || endDate || paymentType) {
        const conditions = [];
        if (paymentType) conditions.push(eq(payments.paymentType, paymentType as string));
        if (startDate) conditions.push(gte(payments.paidAt, startDate as string));
        if (endDate) conditions.push(lte(payments.paidAt, endDate as string));
        query = query.where(and(...conditions));
      }

      const paymentList = await query;

      // Convert to CSV format
      const csvContent = exportPaymentsToCSV(paymentList);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="payments.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting payments to CSV:", error);
      res.status(500).json({ error: "Failed to export payments to CSV format" });
    }
  });

  // Export chart of accounts to IIF format (QuickBooks Desktop initial setup)
  app.get("/api/quickbooks/export/chart-of-accounts", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member'), async (req, res) => {
    try {
      // Generate standard HOA chart of accounts
      const iifContent = exportChartOfAccountsToIIF();

      res.setHeader('Content-Type', 'application/x-intuit-interchange');
      res.setHeader('Content-Disposition', 'attachment; filename="chart-of-accounts.iif"');
      res.send(iifContent);
    } catch (error) {
      console.error("Error exporting chart of accounts:", error);
      res.status(500).json({ error: "Failed to export chart of accounts" });
    }
  });

  // ============================================
  // BUDGET VARIANCE TRACKING ENDPOINTS
  // Automated budget vs actual analysis and alerts
  // ============================================

  // Get budget variance for a specific month
  app.get("/api/budget/variance/:year/:month", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const { getBudgetVariance } = await import("./services/budget-variance");
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);

      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ error: "Invalid year or month" });
      }

      const report = await getBudgetVariance(year, month);
      res.json(report);
    } catch (error) {
      console.error("Error getting budget variance:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get budget variance";
      res.status(500).json({ error: errorMessage });
    }
  });

  // Get year-to-date budget variance
  app.get("/api/budget/variance/:year/ytd", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const { getYTDBudgetVariance } = await import("./services/budget-variance");
      const year = parseInt(req.params.year);

      if (isNaN(year)) {
        return res.status(400).json({ error: "Invalid year" });
      }

      const report = await getYTDBudgetVariance(year);
      res.json(report);
    } catch (error) {
      console.error("Error getting YTD budget variance:", error);
      res.status(500).json({ error: "Failed to get YTD budget variance" });
    }
  });

  // Check for over-budget alerts
  app.get("/api/budget/alerts/:year/:month", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const { checkOverBudgetAlerts } = await import("./services/budget-variance");
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);

      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ error: "Invalid year or month" });
      }

      const alerts = await checkOverBudgetAlerts(year, month);
      res.json(alerts);
    } catch (error) {
      console.error("Error checking budget alerts:", error);
      res.status(500).json({ error: "Failed to check budget alerts" });
    }
  });

  // Get current month budget health (quick status)
  app.get("/api/budget/health", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const { getBudgetVariance, checkOverBudgetAlerts } = await import("./services/budget-variance");
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const [variance, alerts] = await Promise.all([
        getBudgetVariance(year, month),
        checkOverBudgetAlerts(year, month)
      ]);

      res.json({
        month,
        year,
        summary: variance.summary,
        totalVariancePercent: variance.totalVariancePercent,
        overBudgetCount: variance.overBudgetCount,
        hasAlerts: alerts.hasAlerts,
        criticalCount: alerts.criticalCount,
        warningCount: alerts.warningCount,
        status: alerts.criticalCount > 0 ? "critical" :
                alerts.warningCount > 0 ? "warning" : "ok",
      });
    } catch (error) {
      console.error("Error getting budget health:", error);
      res.status(500).json({ error: "Failed to get budget health" });
    }
  });

  // ============================================
  // DELINQUENCY AUTOMATION ENDPOINTS
  // Eliminates dependency on external accountants
  // ============================================

  // Get all delinquent units that need action
  app.get("/api/delinquency/check", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const { getUnitsNeedingAction } = await import("./services/delinquency-checker");
      const checks = await getUnitsNeedingAction();

      res.json({
        success: true,
        count: checks.length,
        units: checks,
      });

    } catch (error) {
      console.error("Error checking delinquencies:", error);
      res.status(500).json({ error: "Failed to check delinquencies" });
    }
  });

  // Manual trigger for delinquency check (for testing)
  app.post("/api/delinquency/trigger", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member'), async (req, res) => {
    try {
      const { triggerManualDelinquencyCheck } = await import("./services/cron-jobs");
      const result = await triggerManualDelinquencyCheck();

      res.json(result);

    } catch (error) {
      console.error("Error triggering delinquency check:", error);
      res.status(500).json({ error: "Failed to trigger delinquency check" });
    }
  });

  // Get new delinquencies for board notification
  app.get("/api/delinquency/new", authMiddleware, requireRole('board_secretary', 'board_treasurer', 'board_member', 'management'), async (req, res) => {
    try {
      const { getNewDelinquencies } = await import("./services/delinquency-checker");
      const newDelinquencies = await getNewDelinquencies();

      res.json({
        success: true,
        count: newDelinquencies.length,
        units: newDelinquencies,
      });

    } catch (error) {
      console.error("Error getting new delinquencies:", error);
      res.status(500).json({ error: "Failed to get new delinquencies" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
