CREATE TABLE "assessments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_name" text NOT NULL,
	"assessment_type" text NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"amount_per_unit" numeric(10, 2) NOT NULL,
	"start_date" timestamp NOT NULL,
	"due_date" timestamp,
	"description" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "board_actions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action_type" text NOT NULL,
	"description" text NOT NULL,
	"related_to" text,
	"related_id" varchar,
	"approved_by" varchar NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text NOT NULL,
	"uploaded_by" varchar NOT NULL,
	"related_to" text,
	"related_id" varchar,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"notification_type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "owners" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" varchar NOT NULL,
	"full_name" text NOT NULL,
	"email" text,
	"phone" text,
	"mailing_address" text,
	"is_primary" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" varchar NOT NULL,
	"plan_type" text NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"monthly_payment" numeric(10, 2) NOT NULL,
	"remaining_balance" numeric(10, 2) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_type" text NOT NULL,
	"payment_method" text NOT NULL,
	"stripe_payment_id" text,
	"status" text DEFAULT 'completed' NOT NULL,
	"notes" text,
	"paid_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_number" text NOT NULL,
	"monthly_maintenance" numeric(10, 2) NOT NULL,
	"maintenance_balance" numeric(10, 2) DEFAULT '0' NOT NULL,
	"first_assessment_status" text NOT NULL,
	"first_assessment_balance" numeric(10, 2) DEFAULT '0' NOT NULL,
	"second_assessment_status" text NOT NULL,
	"second_assessment_balance" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_owed" numeric(10, 2) DEFAULT '0' NOT NULL,
	"delinquency_status" text NOT NULL,
	"priority_level" text NOT NULL,
	"notes" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "units_unit_number_unique" UNIQUE("unit_number")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"unit_id" varchar,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vendor_invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" varchar NOT NULL,
	"invoice_number" text,
	"amount" numeric(10, 2) NOT NULL,
	"invoice_date" timestamp NOT NULL,
	"due_date" timestamp,
	"description" text,
	"document_url" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"uploaded_by" varchar NOT NULL,
	"approved_by" varchar,
	"paid_date" timestamp,
	"payment_method" text,
	"check_number" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_name" text NOT NULL,
	"service_type" text NOT NULL,
	"vendor_type" text NOT NULL,
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"address" text,
	"monthly_cost" numeric(10, 2),
	"contract_expiration" timestamp,
	"payment_terms" text,
	"last_paid_date" timestamp,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
