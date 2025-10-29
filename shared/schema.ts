import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with role-based access (Board, Management, Owner)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // BCrypt hashed password
  email: text("email").notNull().unique(),
  role: text("role").notNull(), // 'super_admin', 'board_secretary', 'board_treasurer', 'board_member', 'management', 'owner'
  unitId: varchar("unit_id"),
  active: boolean("active").notNull().default(true),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Units table (24 units total)
export const units = pgTable("units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unitNumber: text("unit_number").notNull().unique(),

  // ===== MONTHLY CHARGES =====
  monthlyMaintenance: decimal("monthly_maintenance", { precision: 10, scale: 2 }).notNull(),
  monthlyPopularLoan: decimal("monthly_popular_loan", { precision: 10, scale: 2 }).notNull().default("0"),
  monthlyAssessmentPlan: decimal("monthly_assessment_plan", { precision: 10, scale: 2 }).notNull().default("0"),

  // ===== CURRENT BALANCES =====
  maintenanceBalance: decimal("maintenance_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  popularLoanBalance: decimal("popular_loan_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  creditBalance: decimal("credit_balance", { precision: 10, scale: 2 }).notNull().default("0"), // Negative = owner has credit
  totalOwed: decimal("total_owed", { precision: 10, scale: 2 }).notNull().default("0"),

  // ===== 2024 SPECIAL ASSESSMENT TRACKING =====
  assessment2024Original: decimal("assessment_2024_original", { precision: 10, scale: 2 }).notNull().default("11920.92"),
  assessment2024Paid: decimal("assessment_2024_paid", { precision: 10, scale: 2 }).notNull().default("0"),
  assessment2024Remaining: decimal("assessment_2024_remaining", { precision: 10, scale: 2 }).notNull().default("0"),
  assessment2024Status: text("assessment_2024_status").notNull().default("pending"), // 'PAID IN FULL', '3-YEAR PLAN', 'PARTIAL', 'UNPAID'

  // ===== ASSESSMENT PAYMENT PLAN (for 3-year plans) =====
  onAssessmentPlan: boolean("on_assessment_plan").notNull().default(false),
  assessmentPlanStartDate: timestamp("assessment_plan_start_date"),
  assessmentPlanEndDate: timestamp("assessment_plan_end_date"),
  assessmentPlanMonthly: decimal("assessment_plan_monthly", { precision: 10, scale: 2 }).notNull().default("0"),
  assessmentPlanMonthsTotal: integer("assessment_plan_months_total").default(0),
  assessmentPlanMonthsCompleted: integer("assessment_plan_months_completed").default(0),

  // ===== LEGACY FIELDS (keep for backward compatibility) =====
  firstAssessmentStatus: text("first_assessment_status").notNull(), // 'paid', 'paying', 'owed'
  firstAssessmentBalance: decimal("first_assessment_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  secondAssessmentStatus: text("second_assessment_status").notNull(), // 'paid', 'plan', 'owed', 'attorney'
  secondAssessmentBalance: decimal("second_assessment_balance", { precision: 10, scale: 2 }).notNull().default("0"),

  // ===== STATUS & METADATA =====
  delinquencyStatus: text("delinquency_status").notNull(), // 'current', 'pending', '30-60days', '90plus', 'attorney'
  priorityLevel: text("priority_level").notNull(), // 'low', 'medium', 'high', 'critical', 'attorney'
  redFlag: boolean("red_flag").notNull().default(false), // Quick visual indicator
  withAttorney: boolean("with_attorney").notNull().default(false),
  inForeclosure: boolean("in_foreclosure").notNull().default(false),
  notes: text("notes"),
  legalNotes: text("legal_notes"),
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
// Separates regular monthly maintenance from special assessments (Popular Loan, 2024 Assessment)
export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentName: text("assessment_name").notNull(),
  assessmentType: text("assessment_type").notNull(), // 'REGULAR_MONTHLY', 'SPECIAL_LOAN_POPULAR', 'SPECIAL_2024_ASSESSMENT', 'SPECIAL_ONE_TIME'
  fundType: text("fund_type").notNull(), // 'OPERATING', 'RESERVE' - Florida FS 718.116 compliance
  frequency: text("frequency").notNull(), // 'monthly', 'one_time', 'quarterly', 'annual'
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  amountPerUnit: decimal("amount_per_unit", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  dueDate: timestamp("due_date"),
  endDate: timestamp("end_date"), // For recurring assessments, when they end
  description: text("description"),
  isRecurring: boolean("is_recurring").notNull().default(false), // True for monthly maintenance
  allocateTo: text("allocate_to"), // 'maintenance', 'reserves', 'special_project'
  status: text("status").notNull().default("active"), // 'active', 'completed', 'cancelled'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Vendors table (for property management)
export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorName: text("vendor_name").notNull(),
  serviceType: text("service_type").notNull(), // 'Elevator Maintenance', 'Property Insurance', 'Electricity', etc.
  vendorType: text("vendor_type").notNull(), // 'management_company', 'accounting_cpa', 'legal_attorney', 'insurance_provider', 'elevator_service', 'laundry_company', 'cleaning_janitorial', 'security_camera', 'fpl_electricity', 'comcast_internet_cable', 'water_city_north_miami', 'fire_department', 'maintenance_repair', 'landscaping', 'other'
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  address: text("address"),
  monthlyCost: decimal("monthly_cost", { precision: 10, scale: 2 }),
  contractExpiration: timestamp("contract_expiration"),
  paymentTerms: text("payment_terms"), // 'Net 30', 'Net 15', 'Annual', etc.
  lastPaidDate: timestamp("last_paid_date"),
  status: text("status").notNull().default("active"), // 'active', 'inactive'
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Invoices table (vendor invoice management)
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  invoiceDate: timestamp("invoice_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  glCode: text("gl_code"), // General Ledger code for accounting
  description: text("description"),
  fileUrl: text("file_url"), // URL to uploaded invoice PDF
  fileName: text("file_name"), // Original filename
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected', 'paid'
  paymentDate: timestamp("payment_date"),
  paymentMethod: text("payment_method"), // 'check', 'ach', 'wire'
  checkNumber: text("check_number"),
  uploadedBy: varchar("uploaded_by").notNull(), // user ID
  approvedBy: varchar("approved_by"), // user ID who approved
  approvedAt: timestamp("approved_at"), // when approved
  rejectedBy: varchar("rejected_by"), // user ID who rejected
  rejectedAt: timestamp("rejected_at"), // when rejected
  rejectionReason: text("rejection_reason"), // why rejected
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Ledger Entries table (unit financial transaction ledger)
export const ledgerEntries = pgTable("ledger_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unitId: varchar("unit_id").notNull(),
  entryType: text("entry_type").notNull(), // 'assessment', 'payment', 'late_fee', 'interest', 'adjustment'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  referenceId: varchar("reference_id"), // Reference to related payment, assessment, etc.
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull(), // Running balance after this entry
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

// Bank Accounts table (for financial reporting - tracks all bank accounts and reconciliations)
// FLORIDA LAW COMPLIANCE: FS 718.116 requires separation of Operating and Reserve funds
export const bankAccounts = pgTable("bank_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountName: text("account_name").notNull(), // 'Popular Bank - Operating (1343)', 'Truist Bank - Reserve (5602)', etc.
  accountType: text("account_type").notNull(), // 'OPERATING', 'RESERVE', 'ESCROW' (only one of each OPERATING and RESERVE allowed)
  fundType: text("fund_type").notNull(), // 'operating', 'reserve', 'escrow' - for Florida statutory compliance
  bankName: text("bank_name").notNull(), // 'Popular Bank', 'Truist Bank'
  accountNumber: text("account_number"), // Last 4 digits or full account number
  routingNumber: text("routing_number"), // Bank routing number
  currentBalance: decimal("current_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  minimumBalance: decimal("minimum_balance", { precision: 10, scale: 2 }).default("0"), // Minimum required balance for reserves
  lastReconciled: timestamp("last_reconciled"),
  reconciledBalance: decimal("reconciled_balance", { precision: 10, scale: 2 }),
  outstandingChecks: jsonb("outstanding_checks"), // Array of {checkNumber, amount, payee, date}
  isProtected: boolean("is_protected").notNull().default(false), // If true, cannot transfer to operating (Florida law)
  status: text("status").notNull().default("active"), // 'active', 'closed'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Monthly Budget table (for actual vs budget comparisons)
export const monthlyBudget = pgTable("monthly_budget", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  year: integer("year").notNull(),
  category: text("category").notNull(), // 'assessment_income', 'reserve_assessment', 'management_fees', 'utilities', etc.
  subcategory: text("subcategory"), // 'water_sewer', 'electricity', 'elevator_maintenance', etc.
  monthlyBudget: decimal("monthly_budget", { precision: 10, scale: 2 }).notNull(),
  annualBudget: decimal("annual_budget", { precision: 10, scale: 2 }).notNull(),
  categoryType: text("category_type").notNull(), // 'revenue' or 'expense'
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Budget Proposals table (AI-generated budget proposals)
export const budgetProposals = pgTable("budget_proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  proposalYear: integer("proposal_year").notNull(), // Year this budget is for (e.g., 2026)
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
  generatedBy: varchar("generated_by").notNull(), // user ID or 'system'
  executiveSummary: text("executive_summary").notNull(),
  recommendedAssessment: decimal("recommended_assessment", { precision: 10, scale: 2 }).notNull(), // Per unit monthly
  assessmentChange: text("assessment_change"), // '+5%', '-2%', 'No Change'
  scenarios: jsonb("scenarios").notNull(), // {conservative: {...}, moderate: {...}, optimistic: {...}}
  revenueProjections: jsonb("revenue_projections").notNull(), // Detailed revenue breakdown
  expenseProjections: jsonb("expense_projections").notNull(), // Detailed expense breakdown
  capitalProjects: jsonb("capital_projects"), // Array of proposed projects
  risks: jsonb("risks"), // Array of identified risks
  recommendations: jsonb("recommendations"), // Array of action items
  aiModel: text("ai_model").default("claude-sonnet-4-20250514"), // AI model used for generation
  pdfUrl: text("pdf_url"), // URL to generated PDF report
  status: text("status").notNull().default("draft"), // 'draft', 'under_review', 'approved', 'rejected', 'implemented'
  approvedBy: varchar("approved_by"), // user ID
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Unit Owners join table (many-to-many relationship)
export const unitOwners = pgTable("unit_owners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unitId: varchar("unit_id").notNull(),
  ownerId: varchar("owner_id").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Chart of Accounts
export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  accountType: text("account_type").notNull(), // 'asset', 'liability', 'equity', 'income', 'expense', 'reserve', 'sa_income', 'sa_expense'
  parentId: varchar("parent_id"),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Budget Plans
export const budgetPlans = pgTable("budget_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fiscalYear: integer("fiscal_year").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull().default("draft"), // 'draft', 'board_review', 'adopted'
  createdBy: varchar("created_by").notNull(),
  adoptedAt: timestamp("adopted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Budget Lines
export const budgetLines = pgTable("budget_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: varchar("plan_id").notNull(),
  accountId: varchar("account_id").notNull(),
  annualTotal: decimal("annual_total", { precision: 10, scale: 2 }).notNull(),
  monthlyJson: jsonb("monthly_json").notNull(), // Array of 12 monthly amounts
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// GL Actuals (for historical imports and future transactions)
export const glActuals = pgTable("gl_actuals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").notNull(),
  period: timestamp("period").notNull(), // First day of month
  debit: decimal("debit", { precision: 10, scale: 2 }).notNull().default("0"),
  credit: decimal("credit", { precision: 10, scale: 2 }).notNull().default("0"),
  source: text("source").notNull().default("imported"), // 'imported', 'historic', 'manual'
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Bank Transactions (imported register)
export const bankTransactions = pgTable("bank_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountName: text("account_name").notNull(),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  checkNo: text("check_no"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  source: text("source").notNull().default("imported"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Historic AR Snapshots (read-only)
export const historicArSnapshots = pgTable("historic_ar_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  asOfDate: timestamp("as_of_date").notNull(),
  unitNumber: text("unit_number").notNull(),
  ownerName: text("owner_name").notNull(),
  fund: text("fund").notNull(), // 'Operating', 'Special Assessment'
  bucket: text("bucket").notNull(), // '0-30', '30-60', '60-90', '>90'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Historic AP Snapshots (read-only)
export const historicApSnapshots = pgTable("historic_ap_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  asOfDate: timestamp("as_of_date").notNull(),
  vendor: text("vendor").notNull(),
  bucket: text("bucket").notNull(), // '0-30', '30-60', '60-90', '>90'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Audit Log (for data changes)
export const auditLog = pgTable("audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  action: text("action").notNull(), // 'create', 'update', 'delete', 'import', 'export'
  entityType: text("entity_type").notNull(), // 'invoice', 'budget', 'owner', etc.
  entityId: varchar("entity_id"),
  details: jsonb("details"), // JSON object with relevant data
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Activity Log (for user actions and security events)
export const activityLog = pgTable("activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"), // Nullable for failed login attempts
  username: text("username"), // Store username even if user doesn't exist
  activityType: text("activity_type").notNull(), // 'login', 'logout', 'failed_login', 'password_change', 'account_locked', 'account_unlocked'
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"), // Browser/device information
  success: boolean("success").notNull().default(true),
  failureReason: text("failure_reason"), // Reason for failure if success=false
  metadata: jsonb("metadata"), // Additional context data
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Financial Reports table (Monthly PDF reports)
export const financialReports = pgTable("financial_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportMonth: integer("report_month").notNull(), // 1-12
  reportYear: integer("report_year").notNull(),
  reportType: text("report_type").notNull().default("monthly"), // 'monthly', 'annual', 'quarterly'
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
  generatedBy: varchar("generated_by").notNull(), // user ID or 'system'
  netIncome: decimal("net_income", { precision: 10, scale: 2 }),
  collectionRate: decimal("collection_rate", { precision: 5, scale: 2 }), // Percentage
  totalCash: decimal("total_cash", { precision: 10, scale: 2 }),
  unitsInArrears: integer("units_in_arrears"),
  aiCommentary: text("ai_commentary"), // AI-generated management discussion & analysis
  pdfUrl: text("pdf_url").notNull(), // URL to generated PDF
  pdfFilename: text("pdf_filename").notNull(),
  emailedTo: jsonb("emailed_to"), // Array of email addresses report was sent to
  emailedAt: timestamp("emailed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
  updatedAt: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLedgerEntrySchema = createInsertSchema(ledgerEntries).omit({
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

export const insertBankAccountSchema = createInsertSchema(bankAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMonthlyBudgetSchema = createInsertSchema(monthlyBudget).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBudgetProposalSchema = createInsertSchema(budgetProposals).omit({
  id: true,
  generatedAt: true,
  createdAt: true,
});

export const insertFinancialReportSchema = createInsertSchema(financialReports).omit({
  id: true,
  generatedAt: true,
  createdAt: true,
});

export const insertUnitOwnerSchema = createInsertSchema(unitOwners).omit({
  id: true,
  createdAt: true,
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBudgetPlanSchema = createInsertSchema(budgetPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBudgetLineSchema = createInsertSchema(budgetLines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGlActualSchema = createInsertSchema(glActuals).omit({
  id: true,
  createdAt: true,
});

export const insertBankTransactionSchema = createInsertSchema(bankTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertHistoricArSnapshotSchema = createInsertSchema(historicArSnapshots).omit({
  id: true,
  createdAt: true,
});

export const insertHistoricApSnapshotSchema = createInsertSchema(historicApSnapshots).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLog).omit({
  id: true,
  createdAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({
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

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export type InsertLedgerEntry = z.infer<typeof insertLedgerEntrySchema>;
export type LedgerEntry = typeof ledgerEntries.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertBoardAction = z.infer<typeof insertBoardActionSchema>;
export type BoardAction = typeof boardActions.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;
export type BankAccount = typeof bankAccounts.$inferSelect;

export type InsertMonthlyBudget = z.infer<typeof insertMonthlyBudgetSchema>;
export type MonthlyBudget = typeof monthlyBudget.$inferSelect;

export type InsertBudgetProposal = z.infer<typeof insertBudgetProposalSchema>;
export type BudgetProposal = typeof budgetProposals.$inferSelect;

export type InsertFinancialReport = z.infer<typeof insertFinancialReportSchema>;
export type FinancialReport = typeof financialReports.$inferSelect;

export type InsertUnitOwner = z.infer<typeof insertUnitOwnerSchema>;
export type UnitOwner = typeof unitOwners.$inferSelect;

export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

export type InsertBudgetPlan = z.infer<typeof insertBudgetPlanSchema>;
export type BudgetPlan = typeof budgetPlans.$inferSelect;

export type InsertBudgetLine = z.infer<typeof insertBudgetLineSchema>;
export type BudgetLine = typeof budgetLines.$inferSelect;

export type InsertGlActual = z.infer<typeof insertGlActualSchema>;
export type GlActual = typeof glActuals.$inferSelect;

export type InsertBankTransaction = z.infer<typeof insertBankTransactionSchema>;
export type BankTransaction = typeof bankTransactions.$inferSelect;

export type InsertHistoricArSnapshot = z.infer<typeof insertHistoricArSnapshotSchema>;
export type HistoricArSnapshot = typeof historicArSnapshots.$inferSelect;

export type InsertHistoricApSnapshot = z.infer<typeof insertHistoricApSnapshotSchema>;
export type HistoricApSnapshot = typeof historicApSnapshots.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLog.$inferSelect;

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLog.$inferSelect;
