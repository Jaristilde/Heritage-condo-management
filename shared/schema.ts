import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with role-based access (Board, Management, Owner)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(), // 'board', 'management', 'owner'
  unitId: varchar("unit_id"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Units table (24 units total)
export const units = pgTable("units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unitNumber: text("unit_number").notNull().unique(),
  monthlyMaintenance: decimal("monthly_maintenance", { precision: 10, scale: 2 }).notNull(),
  maintenanceBalance: decimal("maintenance_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  firstAssessmentStatus: text("first_assessment_status").notNull(), // 'paid', 'paying', 'owed'
  firstAssessmentBalance: decimal("first_assessment_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  secondAssessmentStatus: text("second_assessment_status").notNull(), // 'paid', 'plan', 'owed', 'attorney'
  secondAssessmentBalance: decimal("second_assessment_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  totalOwed: decimal("total_owed", { precision: 10, scale: 2 }).notNull().default("0"),
  delinquencyStatus: text("delinquency_status").notNull(), // 'current', 'pending', '30-60days', '90plus', 'attorney'
  priorityLevel: text("priority_level").notNull(), // 'low', 'medium', 'high', 'critical', 'attorney'
  notes: text("notes"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Owners table (linked to units)
export const owners = pgTable("owners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unitId: varchar("unit_id").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  mailingAddress: text("mailing_address"),
  isPrimary: boolean("is_primary").notNull().default(true),
  status: text("status").notNull().default("active"), // 'active', 'deceased', 'sold'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Payment Plans (for units with approved payment arrangements)
export const paymentPlans = pgTable("payment_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unitId: varchar("unit_id").notNull(),
  planType: text("plan_type").notNull(), // 'second_assessment', 'maintenance_arrears'
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  monthlyPayment: decimal("monthly_payment", { precision: 10, scale: 2 }).notNull(),
  remainingBalance: decimal("remaining_balance", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("active"), // 'active', 'completed', 'defaulted'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Payments table (transaction history)
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unitId: varchar("unit_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentType: text("payment_type").notNull(), // 'maintenance', 'first_assessment', 'second_assessment', 'late_fee'
  paymentMethod: text("payment_method").notNull(), // 'stripe', 'check', 'wire', 'cash'
  stripePaymentId: text("stripe_payment_id"),
  status: text("status").notNull().default("completed"), // 'pending', 'completed', 'failed', 'refunded'
  notes: text("notes"),
  paidAt: timestamp("paid_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Assessments table (special assessments tracking)
export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentName: text("assessment_name").notNull(),
  assessmentType: text("assessment_type").notNull(), // 'first', 'second'
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  amountPerUnit: decimal("amount_per_unit", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  dueDate: timestamp("due_date"),
  description: text("description"),
  status: text("status").notNull().default("active"), // 'active', 'completed'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Vendors table (for property management)
export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorName: text("vendor_name").notNull(),
  vendorType: text("vendor_type").notNull(), // 'maintenance', 'legal', 'insurance', 'utility', 'contractor'
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  status: text("status").notNull().default("active"), // 'active', 'inactive'
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Documents table (for file storage references)
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(), // 'budget', 'report', 'invoice', 'receipt', 'legal', 'other'
  uploadedBy: varchar("uploaded_by").notNull(),
  relatedTo: text("related_to"), // 'unit', 'vendor', 'general'
  relatedId: varchar("related_id"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

// Board Actions (for tracking board decisions and accountability)
export const boardActions = pgTable("board_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actionType: text("action_type").notNull(), // 'resolution', 'payment_plan_approval', 'vendor_approval', 'legal_action'
  description: text("description").notNull(),
  relatedTo: text("related_to"), // 'unit', 'vendor', 'general'
  relatedId: varchar("related_id"),
  approvedBy: varchar("approved_by").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected', 'completed'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notifications table (for alerts and reminders)
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  notificationType: text("notification_type").notNull(), // 'payment_reminder', 'delinquency_alert', 'board_action', 'system'
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertUnitSchema = createInsertSchema(units).omit({
  id: true,
  updatedAt: true,
});

export const insertOwnerSchema = createInsertSchema(owners).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentPlanSchema = createInsertSchema(paymentPlans).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
});

export const insertBoardActionSchema = createInsertSchema(boardActions).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type Unit = typeof units.$inferSelect;

export type InsertOwner = z.infer<typeof insertOwnerSchema>;
export type Owner = typeof owners.$inferSelect;

export type InsertPaymentPlan = z.infer<typeof insertPaymentPlanSchema>;
export type PaymentPlan = typeof paymentPlans.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessments.$inferSelect;

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertBoardAction = z.infer<typeof insertBoardActionSchema>;
export type BoardAction = typeof boardActions.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
