# Heritage Condo - Operational RBAC Policy

## 🎯 **BUSINESS REQUIREMENTS**

### **Operational Staff (Day-to-Day Access):**
- **Joane Aristilde** (Board Secretary)
- **Dan Ward** (Board Member)
- **Jorge** (Management Company)

**These 3 can:**
- ✅ Upload vendor invoices
- ✅ Edit customer/owner information
- ✅ Run full financial reports
- ✅ Access QuickBooks integration
- ✅ Record payments received from owners
- ✅ Update unit notes and status
- ✅ Send notices to owners
- ✅ View all financial data

### **Financial Approval Authority (Board-Only):**
- **Joane Aristilde** (Board Secretary)
- **Dan Ward** (Board Member)
- **Any other board members**

**ONLY Board Members can:**
- ✅ Approve budgets
- ✅ Approve vendor payments (non-auto)
- ✅ Authorize attorney referrals
- ✅ Modify assessment amounts
- ✅ Waive late fees >$100
- ✅ Approve payment plans

**Management Company (Jorge) CANNOT:**
- ❌ Approve vendor payments
- ❌ Approve budgets
- ❌ Authorize legal action
- ❌ Waive fees >$50

---

## 📋 **DETAILED PERMISSIONS MATRIX**

### **1. Invoice Management**

| Action | Joane | Dan | Jorge | Notes |
|--------|-------|-----|-------|-------|
| Upload invoice | ✅ | ✅ | ✅ | Anyone can upload |
| Edit invoice details | ✅ | ✅ | ✅ | Before approval |
| Approve invoice for payment | ✅ | ✅ | ❌ | Board only |
| Mark invoice as paid | ✅ | ✅ | ❌ | After payment made |
| Delete invoice | ✅ | ❌ | ❌ | Secretary only |
| View all invoices | ✅ | ✅ | ✅ | Full visibility |

**Workflow:**
```
Jorge uploads invoice → Joane or Dan reviews → Board approves →
Joane pays via bank → Joane marks as paid in system
```

---

### **2. Owner/Customer Information**

| Action | Joane | Dan | Jorge | Notes |
|--------|-------|-----|-------|-------|
| View owner info | ✅ | ✅ | ✅ | All unit details |
| Edit owner contact info | ✅ | ✅ | ✅ | Email, phone, address |
| Edit owner financial info | ✅ | ✅ | ❌ | Balances, assessments |
| Add notes to owner account | ✅ | ✅ | ✅ | Communication log |
| Record payments from owners | ✅ | ✅ | ✅ | From any source |
| Adjust balances | ✅ | ✅ | ❌ | Corrections >$100 need Dan approval |
| Delete owner | ❌ | ❌ | ❌ | No one (data integrity) |

**Example:**
- Jorge receives call: "My phone number changed"
  - Jorge logs in → Updates phone number ✅
- Owner disputes balance
  - Jorge can view, add note, but CANNOT adjust
  - Escalates to Joane/Dan for resolution

---

### **3. Financial Reports**

| Report Type | Joane | Dan | Jorge | Export |
|-------------|-------|-----|-------|--------|
| Monthly Financial Report | ✅ | ✅ | ✅ | PDF, Excel, QB |
| Balance Sheet | ✅ | ✅ | ✅ | PDF, Excel, QB |
| Income Statement | ✅ | ✅ | ✅ | PDF, Excel, QB |
| Delinquency Report | ✅ | ✅ | ✅ | PDF, Excel |
| Unit Ledgers (All) | ✅ | ✅ | ✅ | PDF, Excel, QB |
| Bank Reconciliation | ✅ | ✅ | ❌ | Board only |
| Budget vs Actual | ✅ | ✅ | ✅ | PDF, Excel, QB |
| Assessment Collection Report | ✅ | ✅ | ✅ | PDF, Excel, QB |
| Vendor Payment History | ✅ | ✅ | ✅ | PDF, Excel, QB |
| Tax Reports (1099, etc.) | ✅ | ✅ | ❌ | Board only |

**All reports can be:**
- Generated on-demand
- Scheduled (monthly auto-send)
- Exported to QuickBooks
- Downloaded as PDF/Excel

---

### **4. Budget & Financial Planning**

| Action | Joane | Dan | Jorge | Approval Required |
|--------|-------|-----|-------|-------------------|
| View current budget | ✅ | ✅ | ✅ | No |
| Generate AI budget proposal | ✅ | ✅ | ✅ | No (just a proposal) |
| Submit budget for approval | ✅ | ✅ | ❌ | No (creating draft) |
| **APPROVE budget** | ✅ | ✅ | ❌ | **Board vote** |
| Modify approved budget | ✅ | ✅ | ❌ | Board vote required |
| Track expenses vs budget | ✅ | ✅ | ✅ | No |

**Workflow:**
```
Jorge or Joane: Generate AI budget proposal → Review with Dan →
Board meeting vote → Joane marks as "Approved" →
System uses for variance tracking
```

---

### **5. Vendor Payments**

#### **AUTO-PAYMENT Vendors (Recurring)**
Examples: Electricity, water, insurance, management fees

| Action | Joane | Dan | Jorge | Notes |
|--------|-------|-----|-------|-------|
| Setup auto-payment | ✅ | ✅ | ❌ | Board only |
| View auto-payment schedule | ✅ | ✅ | ✅ | All can see |
| Pause/cancel auto-payment | ✅ | ✅ | ❌ | Board only |
| Record auto-payment made | ✅ | ✅ | ✅ | After bank confirms |

**Process:**
```
Bank auto-pays vendor → Jorge sees charge →
Jorge uploads invoice → Marks as "Auto-Paid" →
No board approval needed (pre-authorized)
```

#### **NON-AUTO Vendors (One-Time/Discretionary)**
Examples: Repairs, legal fees, special projects

| Action | Joane | Dan | Jorge | Notes |
|--------|-------|-----|-------|-------|
| Upload invoice | ✅ | ✅ | ✅ | Anyone |
| Submit for approval | ✅ | ✅ | ✅ | Puts in approval queue |
| **APPROVE payment** | ✅ | ✅ | ❌ | **Board only** |
| Pay vendor (bank website) | ✅ | ❌ | ❌ | Secretary only |
| Mark as paid in system | ✅ | ✅ | ❌ | After payment made |

**Workflow:**
```
Vendor sends invoice → Jorge uploads →
System notifies Joane/Dan → Board reviews →
Board approves → Joane pays via bank →
Joane marks paid in system →
Owner portal shows expense
```

---

### **6. QuickBooks Integration**

| Action | Joane | Dan | Jorge | Notes |
|--------|-------|-----|-------|-------|
| Export reports to QB | ✅ | ✅ | ✅ | Read-only export |
| Sync chart of accounts | ✅ | ❌ | ❌ | Secretary only |
| Import transactions from QB | ✅ | ❌ | ❌ | Secretary only |
| Map accounts (QB ↔ System) | ✅ | ❌ | ❌ | Secretary only |

**What Gets Synced:**
- ✅ Vendor invoices → QB Bills
- ✅ Owner payments → QB Deposits
- ✅ Unit ledgers → QB Customer Accounts
- ✅ Financial reports → QB Reports
- ✅ Chart of accounts → QB Account List

**QuickBooks Workflow:**
```
Heritage System is "Source of Truth" →
Daily/Weekly export to QuickBooks →
Accountant uses QB for tax prep →
No data entry duplication
```

---

## 🔐 **SECURITY SAFEGUARDS**

### **Dual Approval Requirements:**

**Requires 2 board members (Joane + Dan or other):**
1. Budget approval >$10,000 variance
2. Vendor payments >$2,500 (one-time)
3. Special assessments
4. Reserve fund usage
5. Legal fee authorization

**Single Approval (Joane or Dan alone):**
1. Vendor payments <$2,500
2. Owner balance corrections <$500
3. Late fee waivers <$100
4. Routine invoice approvals

**No Approval Needed:**
1. Recording owner payments (any amount)
2. Uploading invoices for review
3. Editing contact information
4. Running reports
5. Adding notes/communication logs

---

## 🔄 **OPERATIONAL WORKFLOWS**

### **Daily Tasks (Jorge or Joane):**

**Morning (9 AM):**
- Check owner payments overnight
- Record any checks received
- Upload new vendor invoices
- Respond to owner emails

**Afternoon (2 PM):**
- Review delinquency alerts
- Process payment plan payments
- Update unit notes from calls
- Export daily activity to QB

### **Weekly Tasks (Joane):**

**Monday:**
- Review pending invoice approvals with Dan
- Approve/reject vendor payments
- Run delinquency report
- Send notices (if needed)

**Friday:**
- Reconcile bank accounts
- Update account balances in system
- Generate weekly cash flow report
- Review budget variances

### **Monthly Tasks (Board):**

**1st of Month:**
- Generate monthly financial report
- Review with board
- Approve new budget items
- Send report to all owners

**15th of Month:**
- Run AR aging report
- Review delinquent accounts
- Authorize attorney referrals (if needed)
- Plan next board meeting agenda

---

## 📞 **ESCALATION PATHS**

### **Who Handles What:**

**Jorge (Management) handles:**
- Owner questions about balances (view only)
- Maintenance requests
- Move-in/move-out coordination
- Vendor scheduling
- Day-to-day inquiries

**Joane (Board Secretary) handles:**
- Financial disputes
- Payment arrangements
- Late fee waivers
- Invoice approvals
- Legal notices

**Dan (Board Member) provides:**
- Secondary approval on payments
- Budget review
- Policy decisions
- Owner appeals

**Full Board (Monthly Meeting):**
- Major policy changes
- Special assessments
- Budget approval
- Legal actions
- Contractor selection >$5,000

---

## 🎯 **IMPLEMENTATION CHECKLIST**

### **To Enable This Structure:**

**1. User Accounts:**
- ✅ Joane: `board_secretary` role (already exists)
- ⏳ Dan: `board_member` role (need to create - files provided)
- ⏳ Jorge: `management` role (need to create)

**2. System Updates:**
- ⏳ Update invoice approval workflow
- ⏳ Add dual-approval for >$2,500 payments
- ⏳ Create QuickBooks export functionality
- ⏳ Add "Auto-Payment" flag for recurring vendors

**3. QuickBooks Setup:**
- ⏳ Connect QuickBooks account
- ⏳ Map chart of accounts
- ⏳ Configure export schedule
- ⏳ Test sync workflow

**4. Training:**
- ⏳ Train Jorge on system (2 hours)
- ⏳ Train Dan on approval workflow (1 hour)
- ⏳ Document common tasks
- ⏳ Create video tutorials

---

## 💡 **QUICKBOOKS INTEGRATION OPTIONS**

### **Option A: QuickBooks Online API** (Recommended)
**Pros:**
- Real-time sync
- Automatic export
- No manual file handling
- $30-50/month

**Setup:**
1. Sign up for QuickBooks Online
2. Get API credentials
3. Configure in system
4. Map accounts (one-time)
5. Schedule daily sync

### **Option B: IIF File Export** (Budget Option)
**Pros:**
- Free (no API fees)
- Works with QuickBooks Desktop
- Simple export

**Cons:**
- Manual import to QB
- No real-time sync
- More work for Joane

**Process:**
```
System → Export IIF file →
Download → Open QuickBooks Desktop →
Import file → Review/Accept
```

### **Option C: CSV Export to QB** (Simplest)
**Pros:**
- Universal format
- Works with any accounting software
- Flexible

**Cons:**
- Most manual work
- No account mapping
- Requires QB setup each time

---

## 📋 **NEXT STEPS**

### **Priority 1 (This Week):**
1. Create Jorge's management account
2. Create Dan's board member account
3. Update invoice approval workflow
4. Test with sample vendor invoice

### **Priority 2 (This Month):**
1. Setup QuickBooks integration
2. Train Jorge on system
3. Document approval thresholds
4. Create vendor auto-payment list

### **Priority 3 (Next Quarter):**
1. Implement dual approval for large payments
2. Add QuickBooks real-time sync
3. Create mobile app for approvals
4. Automate more workflows

---

**This structure ensures:**
- ✅ Board maintains financial control
- ✅ Management can handle day-to-day operations
- ✅ No duplication of work (QB integration)
- ✅ Proper audit trail (all changes logged)
- ✅ Owner transparency (portal access)
- ✅ Florida law compliance (dual control)

**Ready to implement! Want me to create Jorge's account and set up the approval workflow?**
