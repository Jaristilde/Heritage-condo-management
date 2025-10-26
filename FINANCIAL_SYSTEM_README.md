# Heritage Condominium Financial Management System

## Overview

A comprehensive FAANG-quality financial management system for Heritage Condominium Association (24 units) in Miami-Dade County, Florida.

## ✅ COMPLETED FEATURES

### 1. Database Schema (COMPLETE)
All tables have been created in `/shared/schema.ts`:

- **Core Tables**: users, units, owners, payments, assessments
- **Financial Tables**:
  - `invoices` - Vendor invoice management
  - `ledger_entries` - Unit transaction ledger
  - `accounts` - Chart of accounts
  - `budget_plans` & `budget_lines` - Budget planning
  - `gl_actuals` - General ledger actuals
  - `bank_transactions` - Bank register
  - `historic_ar_snapshots` - AR aging snapshots
  - `historic_ap_snapshots` - AP aging snapshots
  - `audit_log` - System audit trail
- **Operations**: vendors, documents, unit_owners (join table)

### 2. Migrations (COMPLETE)
- `migrations/0001_add_invoices_and_ledger.sql` - Invoice and ledger tables
- `migrations/0002_update_invoices_required_fields.sql` - Required field constraints
- `migrations/0003_comprehensive_financial_system.sql` - **Full financial system + 24 units seeded**

**Chart of Accounts includes:**
- Assets (Cash accounts, AR)
- Liabilities (AP, Deferred Revenue)
- Equity (Retained Earnings, Reserves)
- Income (Assessments, Late Fees, Interest)
- Expenses (Admin, Utilities, Service Contracts, R&M, Reserves)

### 3. Modern Navigation (COMPLETE)
- **Top Navigation Bar** (`/client/src/components/top-nav.tsx`):
  - Heritage branding with gradient logo
  - Global search bar (Cmd+K)
  - Theme toggle
  - User dropdown menu
  - **PROMINENT LOGOUT BUTTON** (red-outlined, top-right corner)

- **Sidebar Navigation** (`/client/src/components/app-sidebar.tsx`):
  - Grouped sections: Overview, Financial, Operations, Admin
  - Icon + label design
  - Collapsible
  - Hover effects with cyan accent colors

### 4. Vendor Management (COMPLETE)
- **15 Categories** matching actual operations:
  - Management Company, Accounting/CPA, Legal/Attorney
  - Insurance Provider, Elevator Service, Laundry Company
  - Cleaning/Janitorial, Security/Camera
  - FPL (Electricity), Comcast (Internet/Cable)
  - Water (City of North Miami), Fire Department
  - Maintenance/Repair, Landscaping, Other

- **Pages**:
  - `/vendors` - List view with filters
  - `/vendors/new` - Create vendor form
  - `/vendors/:id/edit` - Edit vendor form

### 5. Invoice Module (COMPLETE)
- **Database**: `invoices` table with vendor_id FK
- **Required Fields**: invoice_number, invoice_date, due_date, amount
- **Optional**: gl_code, description, file_url, payment details

- **Backend Routes**: `/server/routes.ts`
  - GET `/api/invoices` (filters: vendor_id, status)
  - POST `/api/invoices`
  - PUT `/api/invoices/:id`
  - DELETE `/api/invoices/:id`
  - GET `/api/invoices/:id`

- **Frontend Pages**:
  - `/invoices` - List with table, search, filters
  - `/invoices/new` - Create invoice form
  - `/invoices/:id` - Edit invoice form
  - Vendor page has "View Invoices" button

### 6. Unit Ledger (COMPLETE)
- **Database**: `ledger_entries` table
- **Entry Types**: assessment, payment, late_fee, interest, adjustment
- **Backend**: GET `/api/units/:id/ledger`
- **Frontend**: `/units/:id/ledger` - Transaction history with running balance

## 🚧 TODO - REMAINING FEATURES

### 1. Owners Directory
**Database**: Already exists (`owners` and `unit_owners` tables)

**Backend Needed** (`/server/routes.ts`):
```typescript
// Owners CRUD
app.get("/api/owners", async (req, res) => { /* ... */ });
app.post("/api/owners", async (req, res) => { /* ... */ });
app.get("/api/owners/:id", async (req, res) => { /* ... */ });
app.put("/api/owners/:id", async (req, res) => { /* ... */ });
app.delete("/api/owners/:id", async (req, res) => { /* ... */ });

// Unit-Owner associations
app.get("/api/units/:id/owners", async (req, res) => { /* ... */ });
app.post("/api/units/:id/owners", async (req, res) => { /* ... */ });
app.delete("/api/unit-owners/:id", async (req, res) => { /* ... */ });
```

**Frontend Needed**:
- `/client/src/pages/owners.tsx` - Directory with search/filters
- Component: OwnerForm dialog
- Add owners section to unit detail page

**Features**:
- Import owners via CSV
- Link multiple owners to units
- Quick contact actions (email, phone)

### 2. Budget Planning System
**Database**: Already exists (`budget_plans`, `budget_lines`, `accounts`)

**Backend Needed**:
```typescript
// Budget Plans
app.get("/api/budgets", ...);
app.post("/api/budgets", ...);
app.get("/api/budgets/:id", ...);
app.put("/api/budgets/:id", ...);
app.patch("/api/budgets/:id/status", ...); // Change to adopted

// Budget Lines
app.get("/api/budgets/:id/lines", ...);
app.post("/api/budgets/:id/lines", ...);
app.put("/api/budget-lines/:id", ...);

// Chart of Accounts
app.get("/api/accounts", ...);
app.post("/api/accounts", ...);

// Assessment Calculator (read-only)
app.get("/api/budgets/:id/assessment-calculator", ...);
```

**Frontend Needed**:
- `/client/src/pages/budgets.tsx` - List of budget plans
- `/client/src/pages/budgets/new.tsx` - Budget wizard
- `/client/src/pages/budgets/:id.tsx` - Budget editor with 12-month grid
- `/client/src/pages/budgets/:id/assessment-calculator.tsx` - Assessment calculator

**Budget Tools to Implement**:
1. Seed from prior year actuals
2. "Increase by %" across categories
3. Seasonality adjustments (monthly sliders)
4. Copy from another plan
5. Flat spread vs custom monthly allocation

**Assessment Calculator** (Display Only):
- Input: Total monthly operating + reserve needs
- Calculate per-unit assessment (÷ 24 or by % ownership)
- Display table: Unit # → Monthly assessment
- Export to CSV

### 3. Dashboard with KPIs
**Frontend Needed** (`/client/src/pages/board-dashboard-visual.tsx` - enhance existing):

**KPI Cards**:
- Total Cash on Hand (query bank_accounts table)
- YTD Net Income (query gl_actuals)
- Units Paying vs Delinquent (query units table)
- Collection Rate %

**Charts** (use Recharts or similar):
- Monthly revenue trend (12 months)
- Expense breakdown (pie chart)
- Budget vs Actual variance (bar chart)
- Delinquency trend

**Quick Actions**:
- Record Payment
- Create Invoice
- New Budget
- Import Data

**Recent Activity Feed**:
- Latest invoices (query invoices)
- Recent payments (query payments)
- Budget updates (query audit_log)

### 4. CSV Import System
**Database**: Already exists (all snapshot tables ready)

**Backend Needed** (`/server/routes.ts`):
```typescript
app.post("/api/import/owners", upload.single('file'), async (req, res) => {
  // Parse CSV, validate, insert into owners table
});

app.post("/api/import/chart-of-accounts", ...);
app.post("/api/import/gl-actuals", ...);
app.post("/api/import/bank-transactions", ...);
app.post("/api/import/ar-snapshots", ...);
app.post("/api/import/ap-snapshots", ...);

// Download templates
app.get("/api/import/templates/:type", ...);
```

**Frontend Needed**:
- `/client/src/pages/import.tsx` - Import dashboard
- Component: `ImportWizard` - CSV upload with preview and validation
- Templates download buttons

**CSV Templates** (generate downloadable files):
```csv
# owners_import.csv
unitNumber,fullName,email,phone,mailingAddress
"Unit 201","John Smith","john@email.com","305-123-4567","123 Main St"

# chart_of_accounts.csv
code,name,type,parentCode
"1000","Cash - Operating","asset",""

# gl_actuals.csv
period,accountCode,debit,credit
"2025-01-01","7740","2500.00","0.00"

# bank_register.csv
date,accountName,description,checkNo,amount
"2025-01-15","Operating Account","Elevator payment","1234","-850.00"

# ar_snapshot.csv
asOfDate,unitNumber,ownerName,fund,bucket,amount
"2025-01-31","Unit 201","John Smith","Operating","0-30","450.00"
```

### 5. Financial Reports (Read-Only)
**Backend Needed**:
```typescript
app.get("/api/reports/balance-sheet", ...);
app.get("/api/reports/income-statement", ...);
app.get("/api/reports/ar-aging", ...);
app.get("/api/reports/collections-log", ...);
app.get("/api/reports/prepaid-owners", ...);
app.get("/api/reports/ap-aging", ...);
app.get("/api/reports/bank-register", ...);
app.get("/api/reports/bank-reconciliation", ...);
app.get("/api/reports/gl-trial-balance", ...);
```

**Frontend Needed**:
- `/client/src/pages/reports.tsx` - Report selector (enhance existing)
- `/client/src/pages/reports/balance-sheet.tsx`
- `/client/src/pages/reports/income-statement.tsx`
- `/client/src/pages/reports/ar-aging.tsx`
- `/client/src/pages/reports/ap-aging.tsx`
- Component: `ReportViewer` with month selector, export buttons

**Report Features**:
- Month/period selector
- YTD vs Monthly view toggle
- Export to CSV
- Export to PDF (use jsPDF or similar)
- Print-friendly format

### 6. Audit Log Middleware
**Implementation** (`/server/middleware/audit.ts`):
```typescript
export function auditMiddleware(action: string, entityType: string) {
  return async (req, res, next) => {
    const user = req.user;
    await db.insert(auditLog).values({
      userId: user.id,
      action,
      entityType,
      entityId: req.params.id || null,
      details: { body: req.body },
      ipAddress: req.ip,
    });
    next();
  };
}
```

Apply to all POST/PUT/DELETE routes.

## 📋 IMPLEMENTATION GUIDE

### Step 1: Run Database Migrations
```bash
# Ensure DATABASE_URL is set
export DATABASE_URL="postgresql://user:pass@host:port/database"

# Run migrations in order
psql $DATABASE_URL < migrations/0001_add_invoices_and_ledger.sql
psql $DATABASE_URL < migrations/0002_update_invoices_required_fields.sql
psql $DATABASE_URL < migrations/0003_comprehensive_financial_system.sql

# OR use Drizzle push
npm run db:push
```

**This will**:
- Create all tables
- Seed 24 units (201-208, 301-308, 401-408)
- Seed Chart of Accounts

### Step 2: Test Existing Features
```bash
npm run dev
```

Navigate to:
- `/` - Dashboard (existing)
- `/vendors` - Test vendor categories
- `/invoices` - Create/view invoices
- `/units/:id/ledger` - View unit ledger

### Step 3: Build Owners Directory
1. Add storage methods to `/server/storage.ts`
2. Add routes to `/server/routes.ts`
3. Create `/client/src/pages/owners.tsx`
4. Add routes to `/client/src/App.tsx`

### Step 4: Build Budget System
1. Add storage methods for budgets, budget lines
2. Add routes
3. Create budget pages with 12-month grid
4. Implement assessment calculator

### Step 5: Enhance Dashboard
1. Add KPI calculation logic
2. Install chart library: `npm install recharts`
3. Create chart components
4. Add recent activity feed

### Step 6: Build CSV Import
1. Install CSV parser: `npm install papaparse @types/papaparse`
2. Install file upload: `npm install multer @types/multer`
3. Create import routes with validation
4. Create ImportWizard component
5. Generate CSV templates

### Step 7: Build Financial Reports
1. Create report calculation functions
2. Create report routes
3. Create report pages
4. Add PDF export: `npm install jspdf jspdf-autotable`

## 🎨 DESIGN SYSTEM

### Colors
- **Primary**: Cyan/Blue (#0891B2, #0E7490)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Danger**: Red (#EF4444)
- **Neutrals**: Slate (#F8FAFC to #0F172A)

### Typography
- Font: Inter or System UI
- Headers: Bold, clear hierarchy
- Body: Regular, 14-16px

### Components
- All using Radix UI + Tailwind CSS
- Card-based layouts
- Hover elevations
- Smooth transitions

### Navigation
- ✅ Top bar with logo, search, prominent logout
- ✅ Sidebar with grouped sections
- ✅ Collapsible
- ✅ Active state indicators

## 🔐 SECURITY

### Role-Based Access Control
Roles: owner, board, manager, accountant, viewer

**Middleware** (existing in `/server/auth.ts`):
```typescript
requireRole('board', 'management')
```

### Audit Logging
All mutations should be logged to `audit_log` table.

## 📊 REPORTING ARCHITECTURE

### Data Flow
1. **Historical Data**: Import via CSV → Store in snapshot tables
2. **Live Data**: Entered via forms → Store in transactional tables
3. **Reports**: Read from both sources, no mutations

### Critical Rules
- **No Balance Mutations**: Importing historical A/R does NOT update current ledgers
- **Budget Status**: Only one 'adopted' plan per fiscal year
- **Assessment Calculator**: Display-only, no ledger posting

## 🧪 TESTING

### Manual Testing Checklist
- [ ] Login/Logout works
- [ ] Sidebar navigation works
- [ ] Create vendor with new categories
- [ ] Create invoice
- [ ] View invoice list with filters
- [ ] View unit ledger
- [ ] Create owner
- [ ] Link owner to unit
- [ ] Import CSV files
- [ ] Create budget plan
- [ ] Calculate assessments
- [ ] Generate financial reports
- [ ] Export reports to PDF/CSV

## 📚 RESOURCES

### Libraries Already Installed
- Express + TypeScript
- Drizzle ORM
- React + Vite
- TanStack Query
- Radix UI
- Tailwind CSS
- Lucide Icons
- date-fns
- Zod

### Libraries to Install
```bash
npm install recharts papaparse multer jspdf jspdf-autotable
npm install -D @types/papaparse @types/multer
```

## 🚀 DEPLOYMENT

### Environment Variables
```env
DATABASE_URL=postgresql://...
PORT=5000
NODE_ENV=production
```

### Build
```bash
npm run build
npm start
```

## ✨ SUCCESS CRITERIA

- [x] Dashboard loads with modern design
- [x] Logout button is prominently visible
- [x] Can create and manage vendors (15 categories)
- [x] Can create and manage invoices
- [x] View unit ledgers
- [ ] Can import owners and map to units
- [ ] Can build budget with monthly allocation
- [ ] Assessment calculator shows per-unit amounts
- [ ] All financial reports display from imported data
- [ ] CSV/PDF export works on all reports
- [ ] Mobile responsive
- [ ] Clean, modern, professional aesthetic

## 📝 NOTES

- 24 units are already seeded
- Chart of Accounts is already seeded
- All database tables are ready
- Modern navigation is complete
- Vendor and Invoice modules are complete
- Focus next on Owners, Budgets, Dashboard, and CSV imports

---

**Built with**: Express, PostgreSQL, Drizzle ORM, React, TypeScript, TanStack Query, Radix UI, Tailwind CSS

**For**: Heritage Condominium Association, Miami-Dade County, Florida
