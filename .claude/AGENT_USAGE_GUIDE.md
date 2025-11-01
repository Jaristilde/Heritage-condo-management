# Heritage Condo Management - AI Agent System Usage Guide

## 🤖 Complete Agent System (20 Agents)

All 20 specialized AI agents are now available to help you manage Heritage Condominium Association.

---

## 📋 Quick Reference

### How to Use Agents

In Claude Code terminal, type:
```
/[agent-name] [your task description]
```

Example:
```
/invoice-approval Review all pending invoices and notify board
```

---

## 🎯 Agent Directory

### **Foundational Agents** (Always Available)

#### 1. `/meta-agent` - Quality Assurance & Improvement 🔍
**When to use**: Test other agents, validate data, find bugs, suggest improvements

**Examples**:
```bash
/meta-agent Test the invoice approval workflow with edge cases
/meta-agent Verify ledger balances match AR totals
/meta-agent Review delinquency calculation logic for accuracy
```

#### 2. `/orchestration-agent` - Workflow Coordinator 🎯
**When to use**: Complex multi-step tasks involving multiple agents

**Examples**:
```bash
/orchestration-agent Run monthly close process for October 2025
/orchestration-agent Process all pending invoices end-to-end
/orchestration-agent Handle owner move-in for Unit 404 (update records, create account, send welcome email)
```

#### 3. `/architecture-agent` - System Design & Evolution 🏗️
**When to use**: Code reviews, schema changes, performance optimization, technical planning

**Examples**:
```bash
/architecture-agent Review database schema and suggest improvements
/architecture-agent Analyze performance bottlenecks in invoice system
/architecture-agent Plan migration for adding new assessment type
```

---

### **Critical Business Agents** (Daily Operations)

#### 4. `/financial-management` - AR/AP & Ledger Operations 💰
**When to use**: Balance calculations, payment processing, AR/AP reports

**Examples**:
```bash
/financial-management Calculate total balance for Unit 301
/financial-management Record $500 payment for Unit 202
/financial-management Generate AR aging report for all units
/financial-management Verify ledger accuracy for October 2025
```

#### 5. `/invoice-approval` - Invoice Processing & Approvals 📋
**When to use**: Invoice validation, approval routing, AP tracking

**Examples**:
```bash
/invoice-approval Validate new invoice from ABC Plumbing for $1,250
/invoice-approval List all pending invoices awaiting board approval
/invoice-approval Approve invoice INV-12345 and notify management
/invoice-approval Generate report of unpaid approved invoices
```

#### 6. `/delinquency-management` - Collections & Notices ⚠️
**When to use**: Delinquency tracking, notice generation, late fees, attorney referrals

**Examples**:
```bash
/delinquency-management Run daily delinquency check for all units
/delinquency-management Generate 60-day notice for Unit 305
/delinquency-management Calculate late fees for Unit 308 (45 days late)
/delinquency-management Recommend attorney referral for Unit 401
```

#### 7. `/assessment` - Maintenance & Special Assessments 💵
**When to use**: Posting assessments, tracking payments, generating notices

**Examples**:
```bash
/assessment Post November 2025 monthly assessments for all units
/assessment Calculate SA#1 (Popular Loan) balance for Unit 202
/assessment Track SA#2 (2024 Assessment) payment status
/assessment Generate assessment notice for Unit 404
```

#### 8. `/email-notification` - Email Campaigns & Templates ✉️
**When to use**: Sending emails for approvals, notices, alerts, communications

**Examples**:
```bash
/email-notification Send invoice approval request for INV-12345
/email-notification Send 30-day delinquency notice to Unit 305
/email-notification Send budget variance alert to board members
/email-notification Send board meeting reminder to all board members
```

---

### **Supporting Function Agents** (Regular Use)

#### 9. `/unit-management` - Unit & Owner Database 🏢
**When to use**: Updating unit info, ownership changes, multi-unit owners

**Examples**:
```bash
/unit-management Update owner contact info for Unit 404
/unit-management Find all units owned by Dan Ward
/unit-management Add maintenance note to Unit 301
/unit-management Transfer Unit 208 to new owner
```

#### 10. `/reporting` - Financial Reports & Exports 📈
**When to use**: Monthly reports, board packages, QuickBooks exports, AR/AP aging

**Examples**:
```bash
/reporting Generate monthly financial report for October 2025
/reporting Create board meeting package for November 1st
/reporting Export October transactions to QuickBooks format
/reporting Generate AR aging report as of today
```

#### 11. `/owner-portal` - Owner Self-Service 👤
**When to use**: Owner account management, payment portal, unit-specific info

**Examples**:
```bash
/owner-portal Create owner account for Unit 404 new owner
/owner-portal Reset password for owner account owner202
/owner-portal Display payment history for Unit 301
/owner-portal Update owner email preferences
```

#### 12. `/board-governance` - Board Actions & Meetings 🏛️
**When to use**: Tracking board decisions, meeting minutes, resolutions

**Examples**:
```bash
/board-governance Log board approval of 2026 budget
/board-governance Track all board actions from October meeting
/board-governance Generate resolution for special assessment
/board-governance Create meeting minutes template
```

---

### **Advanced Feature Agents** (Periodic Use)

#### 13. `/budget-management` - Budget Planning & Variance 📊
**When to use**: Budget creation, variance analysis, over-budget alerts

**Examples**:
```bash
/budget-management Create 2026 budget proposal
/budget-management Generate variance report for October 2025
/budget-management Flag categories over budget by >20%
/budget-management Forecast cash flow for next 6 months
```

#### 14. `/compliance-legal` - FL HOA Law & Legal Notices ⚖️
**When to use**: Legal compliance, lien filing, attorney referrals, statutory notices

**Examples**:
```bash
/compliance-legal Prepare attorney referral package for Unit 401
/compliance-legal Generate lien filing documents for Unit 305
/compliance-legal Verify payment allocation follows FL Statute 718.116
/compliance-legal Create statutory notice for special assessment
```

#### 15. `/bank-reconciliation` - Bank Reconciliation & Cash Flow 🏦
**When to use**: Reconciling bank statements, matching transactions, cash flow monitoring

**Examples**:
```bash
/bank-reconciliation Reconcile October bank statement
/bank-reconciliation Match transactions to ledger entries
/bank-reconciliation Track cash flow for Q4 2025
/bank-reconciliation Identify unmatched transactions
```

#### 16. `/document-management` - Document Organization & Storage 📁
**When to use**: Organizing documents, file tagging, document retrieval

**Examples**:
```bash
/document-management Organize all October invoices
/document-management Find all documents related to Unit 305
/document-management Tag and categorize uploaded board minutes
/document-management Archive 2024 financial records
```

#### 17. `/automation-cron` - Scheduled Jobs & Automation 🤖
**When to use**: Managing automated tasks, cron jobs, scheduled reports

**Examples**:
```bash
/automation-cron Review all scheduled automation jobs
/automation-cron Add new monthly report automation
/automation-cron Check status of daily delinquency check
/automation-cron Schedule quarterly board package generation
```

#### 18. `/data-import-export` - CSV Processing & Migration 📤
**When to use**: Importing data, exporting reports, data migration

**Examples**:
```bash
/data-import-export Import prior balances from Juda & Eskew CSV
/data-import-export Export all units to CSV format
/data-import-export Migrate SA#1 payment history from spreadsheet
/data-import-export Bulk update unit data from CSV
```

#### 19. `/cpa-agent` - Accounting Best Practices & GAAP Compliance 💼
**When to use**: GAAP compliance, CPA-ready reports, tax preparation, payment processing, bank integration

**Examples**:
```bash
/cpa-agent Generate CPA-ready monthly financial statements for October 2025
/cpa-agent Prepare year-end financial package for 2025 tax filing
/cpa-agent Verify payment allocation follows FL Statute 718.116 for Unit 305
/cpa-agent Reconcile October bank statements and identify discrepancies
/cpa-agent Generate 1099-NEC report for all vendors over $600 in 2025
```

#### 20. `/cybersecurity-agent` - Application Security & Compliance 🔒
**When to use**: Security audits, vulnerability scanning, PII/PHI compliance, security best practices

**Examples**:
```bash
/cybersecurity-agent Perform comprehensive security audit of entire application
/cybersecurity-agent Scan codebase for SQL injection, XSS, and CSRF vulnerabilities
/cybersecurity-agent Audit application for PII protection and compliance
/cybersecurity-agent Review authentication system for security weaknesses
/cybersecurity-agent Check all npm dependencies for known vulnerabilities
```

---

## 🎬 Common Workflows

### **Workflow 1: Monthly Financial Close**
```bash
# Use orchestration agent to coordinate everything
/orchestration-agent Run monthly close for October 2025

# Or run steps individually:
/financial-management Verify all ledger balances
/delinquency-management Run delinquency check
/assessment Post next month's assessments
/reporting Generate monthly board package
/email-notification Send reports to board members
```

### **Workflow 2: New Invoice Processing**
```bash
# Automated workflow
/orchestration-agent Process new invoice from XYZ Vendor, $2,500

# Or manual steps:
/invoice-approval Validate invoice data
/email-notification Send approval request to board
/board-governance Log pending approval
```

### **Workflow 3: Delinquency Escalation**
```bash
# For 90+ day accounts
/delinquency-management Review Unit 401 for attorney referral
/compliance-legal Prepare attorney referral package
/email-notification Send final notice to owner
/board-governance Log escalation decision
```

### **Workflow 4: Budget Planning**
```bash
# Annual budget process
/budget-management Create 2026 budget proposal
/reporting Compare to 2025 actuals
/board-governance Schedule budget approval meeting
/email-notification Send budget draft to board
```

### **Workflow 5: Year-End Tax Preparation**
```bash
# Year-end CPA package
/cpa-agent Prepare year-end financial package for 2025 tax filing
/cpa-agent Generate 1099-NEC report for all vendors over $600
/cpa-agent Reconcile all bank accounts for December 2025
/reporting Generate annual financial statements
/email-notification Send tax package to CPA firm
```

### **Workflow 6: Security Audit**
```bash
# Quarterly security review
/cybersecurity-agent Perform comprehensive security audit
/cybersecurity-agent Check npm dependencies for vulnerabilities
/cybersecurity-agent Audit PII protection compliance
/cybersecurity-agent Review authentication and authorization
/architecture-agent Implement security recommendations
```

---

## 💡 Best Practices

### **When to Use Which Agent**

**🔴 Use specific agents when**:
- You know exactly which function you need
- Task is straightforward and single-purpose
- You want direct control over each step

**🎯 Use orchestration-agent when**:
- Task involves multiple steps across different areas
- You want automated coordination
- Process is complex with dependencies

**🔍 Use meta-agent when**:
- Testing new features
- Validating data accuracy
- Finding bugs or issues
- Improving system performance

**🏗️ Use architecture-agent when**:
- Planning new features
- Reviewing code changes
- Optimizing performance
- Database schema changes

**💼 Use cpa-agent when**:
- Preparing monthly/annual financial reports
- Tax preparation and 1099 generation
- Verifying GAAP compliance
- Bank reconciliation
- Year-end close procedures

**🔒 Use cybersecurity-agent when**:
- Conducting security audits
- Checking for vulnerabilities
- Validating PII/PHI compliance
- Reviewing authentication/authorization
- Assessing third-party integrations

### **Agent Communication**

Agents can call other agents:
```
You → /orchestration-agent → spawns multiple agents
                           → /invoice-approval
                           → /email-notification
                           → /board-governance
```

### **Error Handling**

If an agent fails:
1. Agent will report the error clearly
2. Orchestration agent will handle fallback
3. Meta agent can debug the issue
4. User is always informed of failures

---

## 📊 Agent Performance Tracking

The Meta Agent tracks:
- ✅ Success rate for each agent
- ⏱️ Average execution time
- 🔄 Common error patterns
- 📈 Usage statistics
- 💡 Optimization opportunities

---

## 🆘 Getting Help

### Agent Not Working?
```bash
/meta-agent Debug why the invoice-approval agent failed for INV-12345
```

### Need to Understand Code?
```bash
/architecture-agent Explain how the payment allocation logic works
```

### Complex Task?
```bash
/orchestration-agent Help me process end-of-year financial close
```

---

## 🚀 Quick Start Examples

### **First Time User**
```bash
# Start with meta agent to understand system
/meta-agent Give me an overview of the Heritage Condo system

# Then try a simple task
/unit-management Show me all units and their owners

# Try a workflow
/orchestration-agent Walk me through processing a new invoice
```

### **Board Secretary (Joane)**
```bash
# Daily tasks
/delinquency-management Run daily delinquency check
/invoice-approval Review pending invoices
/email-notification Send any required notices

# Monthly tasks
/orchestration-agent Run monthly close for [month]
/reporting Generate board meeting package
```

### **Management (Jorge)**
```bash
# Upload and track invoices
/invoice-approval Upload new invoice and route for approval
/unit-management Update unit information
/owner-portal Help owner with payment issue
```

---

## 📁 Technical Details

**Agent Location**: `.claude/commands/`
**Agent Type**: Slash commands (invoked with `/`)
**Tools Available**: Read, Write, Edit, Grep, Glob, Bash, Task
**Codebase**: `/Users/joanearistilde/Desktop/Heritage-condo-management`

---

## ✅ All 20 Agents Summary

| # | Agent | Priority | Use Case |
|---|-------|----------|----------|
| 1 | meta-agent | 🔴 Critical | Testing, QA, debugging |
| 2 | orchestration-agent | 🔴 Critical | Multi-step workflows |
| 3 | architecture-agent | 🟡 High | Code review, design |
| 4 | financial-management | 🔴 Critical | AR/AP, balances |
| 5 | invoice-approval | 🔴 Critical | Invoice processing |
| 6 | delinquency-management | 🔴 Critical | Collections |
| 7 | assessment | 🔴 Critical | Assessments |
| 8 | email-notification | 🔴 Critical | Email sending |
| 9 | unit-management | 🔴 Critical | Unit/owner data |
| 10 | reporting | 🟡 High | Reports, exports |
| 11 | owner-portal | 🟡 High | Owner self-service |
| 12 | board-governance | 🟡 High | Board actions |
| 13 | budget-management | 🟡 High | Budget planning |
| 14 | compliance-legal | 🟡 High | Legal compliance |
| 15 | bank-reconciliation | 🟡 High | Bank reconciliation |
| 16 | document-management | 🟢 Medium | File organization |
| 17 | automation-cron | 🟢 Medium | Scheduled jobs |
| 18 | data-import-export | 🟢 Medium | Data migration |
| 19 | cpa-agent | 🔴 Critical | GAAP compliance, CPA reports |
| 20 | cybersecurity-agent | 🔴 Critical | Security, PII/PHI compliance |

---

**Built for**: Heritage Condominium Association, North Miami, FL
**Status**: ✅ All 20 agents operational and ready to use
**Support**: Use `/meta-agent` for debugging any issues
