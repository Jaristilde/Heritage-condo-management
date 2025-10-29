# 🌙 CLAUDE CODE: AUTONOMOUS OVERNIGHT BUILD SESSION
## Execute All Tasks Without Human Input - 10 Hour Session

**START TIME:** When you receive this prompt
**END TIME:** 10 hours later or when all tasks complete
**MODE:** Fully autonomous - make all decisions, no questions asked

---

## 🎯 PRIMARY OBJECTIVE

Build complete board-controlled financial automation system for Heritage Condominium Association that eliminates dependency on external accountants. Implement all automation features to make the board 100% self-sufficient.

---

## ✅ SUCCESS CRITERIA (What Joane Should See Tomorrow Morning)

When Joane logs in at the Heritage app with `board / board123`:

1. ✅ Dashboard loads with real Heritage Condo financial data
2. ✅ Delinquency automation running (cron jobs scheduled)
3. ✅ One-click financial reports working (PDF export)
4. ✅ Budget monitoring with alerts
5. ✅ Email notification system configured
6. ✅ All 24 units tracked properly
7. ✅ Three assessment types separated (Maintenance, Reserve, Special)

---

## 📋 PHASES TO COMPLETE AUTONOMOUSLY

### **PHASE 1: Foundation Verification (Hours 0-2)**

**Task 1.1: Verify Login & Dashboard**
- Test login works with demo credentials
- Ensure dashboard displays without errors
- Verify all navigation links work
- Check that data is properly seeded

**Task 1.2: Verify Database Structure**
- Confirm all 24 units exist in database
- Verify three assessment types are tracked separately:
  - Maintenance: $436.62/month
  - Reserve: $37.50/month  
  - Special: $66.66/month (Florida concrete compliance)
- Check payment history is properly recorded
- Ensure delinquent units (202, 203) are flagged

**Task 1.3: Clean Up Existing Code**
- Remove any broken imports
- Fix console errors
- Ensure all components render properly
- Test all existing features work

**Decision Rule:** If something doesn't work, fix it immediately. Don't move to Phase 2 until login and dashboard are solid.

---

### **PHASE 2: Delinquency Automation System (Hours 2-4)**

**Task 2.1: Automated Delinquency Checks**
Create cron job that runs daily at 6:00 AM to:
- Check all 24 units for overdue payments
- Calculate days overdue
- Categorize by severity:
  - 30 days: Warning email
  - 60 days: Urgent notice
  - 90 days: Attorney referral
- Update delinquency status in database

**Task 2.2: Email Notification Templates**
Create professional email templates for:
- 30-day notice (friendly reminder)
- 60-day notice (urgent payment required)
- 90-day notice (attorney referral warning)
- Board alert emails (when new delinquency detected)

**Task 2.3: Dashboard Delinquency Widget**
Build dashboard widget showing:
- Number of delinquent units
- Total amount overdue
- Units in each stage (30/60/90 days)
- Quick action buttons:
  - "Send Notices Now"
  - "View Delinquent Units"
  - "Generate Collection Report"

**Task 2.4: Manual Trigger Option**
Add button for board to manually trigger delinquency check anytime

**Decision Rule:** If email sending doesn't work with real SMTP, create a mock email service that logs emails to a file. Priority is functionality over perfection.

---

### **PHASE 3: One-Click Financial Reports (Hours 4-6)**

**Task 3.1: Balance Sheet Report**
Generate professional balance sheet showing:
- **Assets:**
  - Operating account balance
  - Reserve account balance
  - Accounts receivable (by unit)
- **Liabilities:**
  - Accounts payable to vendors
  - Prepaid assessments
- **Equity:**
  - Operating fund balance
  - Reserve fund balance

**Task 3.2: Income Statement Report**
Generate monthly P&L showing:
- **Revenue:**
  - Maintenance assessments collected
  - Reserve assessments collected
  - Special assessments collected
  - Late fees
  - Interest income
- **Expenses:**
  - By category (Insurance, Utilities, Repairs, etc.)
  - Vendor payments
  - Professional fees

**Task 3.3: Delinquency/Aging Report**
Generate report showing:
- All units with overdue balances
- Aging buckets (0-30, 31-60, 61-90, 90+ days)
- Payment history for each unit
- Collection actions taken

**Task 3.4: Three-Assessment Collection Report**
Generate report breaking down collections by assessment type:
- Maintenance assessment ($436.62 × 24 units = $10,478.88/month expected)
- Reserve assessment ($37.50 × 24 units = $900/month expected)
- Special assessment ($66.66 × 24 units = $1,599.84/month expected)
- Show collection rate for each type

**Task 3.5: Budget vs Actual Report**
Generate report comparing:
- Budgeted income vs actual income
- Budgeted expenses vs actual expenses
- Variance analysis (over/under budget)
- Year-to-date totals

**Task 3.6: PDF Export Functionality**
Implement clean PDF export for all reports using:
- Professional formatting
- Heritage Condo header/logo
- Date range filters
- Export button on each report page

**Decision Rule:** If PDF generation is complex, start with CSV export and enhance to PDF later. Priority is getting reports working.

---

### **PHASE 4: Email Notification System (Hours 6-7)**

**Task 4.1: Configure Email Service**
Set up email system using:
- Nodemailer or similar library
- Configure SMTP settings
- Create reusable email service module

**Task 4.2: Board Alert Emails**
Create automated emails to board members for:
- New delinquencies detected
- Invoices requiring approval
- Budget threshold exceeded
- Emergency maintenance requests

**Task 4.3: Owner Notification Emails**
Create automated emails to unit owners for:
- Payment received confirmation
- Payment overdue notices
- Assessment amount changes
- Special assessment notifications

**Task 4.4: Email Queue System**
Build email queue to prevent sending failures:
- Queue emails for sending
- Retry failed sends
- Log all sent emails
- Show email history in dashboard

**Decision Rule:** If real email sending isn't working, create a "Development Mode" that logs emails to console and file. The system should work end-to-end even without real email.

---

### **PHASE 5: Budget Monitoring & Alerts (Hours 7-8)**

**Task 5.1: Budget Tracking System**
Implement real-time budget tracking:
- Track spending by category
- Compare to monthly budget
- Calculate remaining budget
- Project end-of-year status

**Task 5.2: Budget Alert Rules**
Create alerts for:
- When category exceeds 80% of budget
- When category exceeds 100% of budget
- When total spending exceeds budget
- When invoice would push over budget

**Task 5.3: Budget Dashboard Widget**
Build dashboard widget showing:
- Budget health score
- Categories over budget (red)
- Categories near budget (yellow)
- Categories under budget (green)
- Quick view of biggest variances

**Task 5.4: Invoice Approval Workflow**
Enhance vendor invoice approval to:
- Check budget before approval
- Warn if approval exceeds budget
- Require board note if over budget
- Track budget impact of each invoice

---

### **PHASE 6: Testing & Polish (Hours 8-10)**

**Task 6.1: End-to-End Testing**
Test complete workflows:
- Unit 302 (Cally) logs in → sees balance
- Board member logs in → sees dashboard
- Delinquency check runs → emails sent
- Generate all 5 report types → PDFs download
- Approve vendor invoice → budget updates
- Payment recorded → emails sent

**Task 6.2: Error Handling**
Add proper error handling for:
- Database connection failures
- Email sending failures
- PDF generation failures
- Missing data scenarios

**Task 6.3: Logging System**
Implement comprehensive logging:
- Log all cron job executions
- Log all email sends
- Log all report generations
- Create daily log files

**Task 6.4: Performance Optimization**
Optimize for speed:
- Add database indexes
- Cache frequently accessed data
- Optimize report queries
- Ensure dashboard loads fast

**Task 6.5: Documentation**
Create/update:
- OVERNIGHT_BUILD_LOG.md (what you built)
- MORNING_CHECKLIST.md (how Joane should test)
- API_DOCUMENTATION.md (all endpoints)
- DEPLOYMENT_GUIDE.md (how to deploy)

---

## 🚨 AUTONOMOUS DECISION-MAKING RULES

Since Joane is asleep, you MUST make decisions yourself:

### **Rule 1: When Technology Doesn't Work**
If a library or approach fails:
- Try an alternative immediately
- Don't wait for human input
- Document what didn't work
- Move forward with working solution

**Examples:**
- PDF library broken? → Try different library or use HTML export
- Email not sending? → Create development mode with file logging
- Cron not working? → Use setInterval as backup

### **Rule 2: When Data is Ambiguous**
If you're unsure about data or logic:
- Make best guess based on context
- Document your assumption
- Implement conservative approach
- Add TODO comment for review

**Examples:**
- Unclear assessment amount? → Use the values from documentation
- Uncertain about workflow? → Implement simplest working version
- Missing data? → Create reasonable mock data

### **Rule 3: When Requirements are Unclear**
If a feature description is vague:
- Implement most common/standard approach
- Focus on core functionality first
- Add enhancements if time permits
- Document what you built

**Examples:**
- "Professional email" → Use standard business email format
- "Alert system" → In-app notifications + email
- "Dashboard widget" → Card with key metrics + action button

### **Rule 4: When You Hit a Blocker**
If completely stuck on one feature:
- Spend max 30 minutes trying to fix
- Document the issue clearly
- Move to next task
- Come back if time permits

**Never spend hours stuck. Keep building.**

### **Rule 5: Troubleshooting Hierarchy**
Use this troubleshooting order:

1. **Try alternative approach** (different library, different method)
2. **Simplify implementation** (basic version that works)
3. **Log thoroughly** (so Joane can debug in morning)
4. **Keep working on other features** (don't let one blocker stop everything)
5. **Document what didn't work** (in OVERNIGHT_BUILD_LOG.md)

**Never say "I need human input" - make your best guess and move forward.**

---

## 🎯 FINAL DELIVERABLE

When complete, ensure these commands work:

```bash
# Start the application
npm run dev

# Should see:
# ✓ Server running
# ✓ Database connected
# ✓ Cron jobs scheduled
# ✓ Ready for login
```

Then in browser:
- Login page loads
- Login with `board` / `board123` → Dashboard loads with data
- Dashboard shows:
  - Delinquency alerts
  - Budget status
  - Recent activity
  - Quick action buttons
- "Reports" page → All 5 report types available
- Click "Download PDF" → PDF downloads immediately
- All features work without errors

---

## 🚀 START NOW

You have 10 hours. Begin with Phase 1, Task 1.1.

Work autonomously. Make decisions. Build features. Test thoroughly.

**Good luck! Joane will be impressed tomorrow morning! 💪**

---

## 📝 FINAL NOTE FOR CLAUDE CODE

Remember:
- You are capable
- You can make good decisions
- The board needs this working
- Joane trusts you to build through the night
- Focus on functionality over perfection
- Working features > perfect code
- Log everything so Joane can review

**Heritage Condominium Data Reference:**
- 24 total units
- Monthly maintenance: $436.62 per unit
- Monthly reserve: $37.50 per unit
- Special assessment: $66.66 per unit
- Delinquent units: 202 (Cally Vann), 203
- Board member: Joane Aristilde (board/board123)
- Management company: Juda Eskew (to be eliminated)
- Attorney for collections: Daniel C. Lopez

**You've got this! Start building! 🚀**
