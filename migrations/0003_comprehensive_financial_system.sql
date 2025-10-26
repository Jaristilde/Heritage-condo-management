-- Comprehensive Financial Management System Schema
-- Heritage Condominium - Miami-Dade

-- Unit Owners join table (many-to-many)
CREATE TABLE "unit_owners" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" varchar NOT NULL,
	"owner_id" varchar NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Chart of Accounts
CREATE TABLE "accounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"account_type" text NOT NULL,
	"parent_id" varchar,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Budget Plans
CREATE TABLE "budget_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fiscal_year" integer NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" varchar NOT NULL,
	"adopted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Budget Lines
CREATE TABLE "budget_lines" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" varchar NOT NULL,
	"account_id" varchar NOT NULL,
	"annual_total" numeric(10, 2) NOT NULL,
	"monthly_json" jsonb NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- GL Actuals (historical and ongoing)
CREATE TABLE "gl_actuals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" varchar NOT NULL,
	"period" timestamp NOT NULL,
	"debit" numeric(10, 2) DEFAULT '0' NOT NULL,
	"credit" numeric(10, 2) DEFAULT '0' NOT NULL,
	"source" text DEFAULT 'imported' NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Bank Transactions (imported register)
CREATE TABLE "bank_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_name" text NOT NULL,
	"date" timestamp NOT NULL,
	"description" text NOT NULL,
	"check_no" text,
	"amount" numeric(10, 2) NOT NULL,
	"source" text DEFAULT 'imported' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Historic AR Snapshots (read-only reporting)
CREATE TABLE "historic_ar_snapshots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"as_of_date" timestamp NOT NULL,
	"unit_number" text NOT NULL,
	"owner_name" text NOT NULL,
	"fund" text NOT NULL,
	"bucket" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Historic AP Snapshots (read-only reporting)
CREATE TABLE "historic_ap_snapshots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"as_of_date" timestamp NOT NULL,
	"vendor" text NOT NULL,
	"bucket" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Audit Log
CREATE TABLE "audit_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" varchar,
	"details" jsonb,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Seed 24 Units (201-208, 301-308, 401-408)
INSERT INTO "units" ("unit_number", "monthly_maintenance", "maintenance_balance", "first_assessment_status", "first_assessment_balance", "second_assessment_status", "second_assessment_balance", "total_owed", "delinquency_status", "priority_level") VALUES
('201', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('202', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('203', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('204', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('205', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('206', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('207', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('208', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('301', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('302', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('303', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('304', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('305', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('306', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('307', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('308', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('401', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('402', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('403', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('404', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('405', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('406', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('407', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low'),
('408', '450.00', '0', 'paid', '0', 'paid', '0', '0', 'current', 'low')
ON CONFLICT ("unit_number") DO NOTHING;
--> statement-breakpoint

-- Seed Chart of Accounts
INSERT INTO "accounts" ("code", "name", "account_type", "parent_id") VALUES
-- Assets
('1000', 'Cash - Operating Account', 'asset', NULL),
('1010', 'Cash - Reserve Account', 'asset', NULL),
('1020', 'Cash - Special Assessment', 'asset', NULL),
('1200', 'Accounts Receivable - Assessments', 'asset', NULL),
('1300', 'Prepaid Insurance', 'asset', NULL),

-- Liabilities
('2000', 'Accounts Payable', 'liability', NULL),
('2100', 'Deferred Revenue', 'liability', NULL),

-- Equity
('3000', 'Retained Earnings', 'equity', NULL),
('3100', 'Reserve Fund Balance', 'equity', NULL),

-- Income - Operating
('4000', 'Assessment Income', 'income', NULL),
('4100', 'Late Fee Income', 'income', NULL),
('4200', 'Interest Income', 'income', NULL),
('4300', 'Other Income', 'income', NULL),

-- Income - Special Assessment
('4500', 'Special Assessment Income', 'sa_income', NULL),

-- Expenses - Administration
('5000', 'Management Fees', 'expense', NULL),
('5010', 'Accounting Fees', 'expense', NULL),
('5020', 'Legal Fees', 'expense', NULL),
('5030', 'Insurance - Liability', 'expense', NULL),
('5040', 'Insurance - Property', 'expense', NULL),
('5050', 'Insurance - D&O', 'expense', NULL),
('5060', 'Postage & Shipping', 'expense', NULL),
('5070', 'Office Supplies', 'expense', NULL),
('5080', 'Bank Fees', 'expense', NULL),

-- Expenses - Utilities
('6000', 'Electricity - FPL', 'expense', NULL),
('6010', 'Water & Sewer', 'expense', NULL),
('6020', 'Cable/Internet - Comcast', 'expense', NULL),
('6030', 'Trash Removal', 'expense', NULL),

-- Expenses - Service Contracts
('6500', 'Elevator Maintenance', 'expense', NULL),
('6510', 'Janitorial Service', 'expense', NULL),
('6520', 'Security/Alarm Monitoring', 'expense', NULL),
('6530', 'Landscaping', 'expense', NULL),
('6540', 'Pool Service', 'expense', NULL),
('6550', 'Fire Alarm Monitoring', 'expense', NULL),
('6560', 'Laundry Equipment', 'expense', NULL),

-- Expenses - Repairs & Maintenance
('7000', 'General Repairs', 'expense', NULL),
('7010', 'Plumbing Repairs', 'expense', NULL),
('7020', 'Electrical Repairs', 'expense', NULL),
('7030', 'HVAC Repairs', 'expense', NULL),
('7040', 'Roof Repairs', 'expense', NULL),
('7050', 'Painting', 'expense', NULL),

-- Expenses - Reserve Contribution
('8000', 'Reserve Contribution', 'reserve', NULL),

-- Expenses - Contingency
('9000', 'Contingency/Miscellaneous', 'expense', NULL)
ON CONFLICT ("code") DO NOTHING;
