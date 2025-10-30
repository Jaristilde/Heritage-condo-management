# 📋 Tomorrow's Action Plan
**Date: Next Session**
**Goal: Complete invoice approval workflow + document library enhancements**

---

## 🎯 Session Goals (3-4 hours)

### ✅ **TASK 1: Fix Invoice Listing Bug** (30 minutes)
**Priority: CRITICAL** 🔴

**Problem:** `/api/invoices` endpoint returning 500 error

**Steps:**
1. Check server logs for exact error
2. Verify invoices table exists and has data
3. Fix query or schema issue in server/routes.ts
4. Test invoice list page loads correctly
5. Verify uploaded invoices show in list

**Expected Outcome:** Invoice list page works, shows all invoices

---

### 🎯 **TASK 2: Complete Board Approval Workflow** (2 hours)
**Priority: HIGH** 🟠

**What We Need:**
Board members need to approve or reject uploaded invoices with comments.

**Sub-tasks:**

#### A. Update Invoice Detail Page (client/src/pages/invoice-form.tsx)
- Add "Approve" and "Reject" buttons (only visible to board members)
- Add comments/notes textarea
- Show approval history section
- Display who approved/rejected and when
- Add rejection reason field (required if rejecting)

#### B. Update Backend API (server/routes.ts)
- Create PATCH `/api/invoices/:id/approve` endpoint
- Create PATCH `/api/invoices/:id/reject` endpoint
- Store approver user ID and timestamp
- Update invoice status
- Return updated invoice

#### C. Update Database Schema (if needed)
- Ensure fields exist:
  - `approved_by` (user ID)
  - `approved_at` (timestamp)
  - `rejected_by` (user ID)
  - `rejected_at` (timestamp)
  - `rejection_reason` (text)
  - `status` (pending/approved/rejected/paid)

#### D. Add Notifications
- Email board members when invoice uploaded
- Email uploader when invoice approved/rejected
- Show notification badge on invoices menu

**Expected Outcome:**
- Board can approve/reject invoices
- Status tracked in database
- History visible on invoice detail page

---

### 📁 **TASK 3: Document Library - Add Assessment & Violation Tabs** (45 minutes)
**Priority: MEDIUM** 🟡

**What We Need:**
Separate sections under Documents for Assessment docs and Violation docs

**Steps:**

#### A. Update Document Categories
In `client/src/pages/documents.tsx`, add two new categories:
```typescript
{ value: "assessment", label: "Assessment Documents", color: "bg-indigo-100 text-indigo-800" },
{ value: "violation", label: "Violation Documents", color: "bg-red-100 text-red-800" },
```

#### B. Update Upload Dialog
- Ensure new categories appear in dropdown
- Add tooltips explaining what belongs in each category

#### C. Test Upload & Filter
- Upload a test assessment document
- Upload a test violation document
- Verify filtering works
- Verify category badges show correctly

**Expected Outcome:**
- Assessment and Violation categories available
- Can upload and organize docs by these categories
- Easy to filter and find relevant documents

---

### 🎁 **BONUS TASK (if time allows): Email Notification Setup** (1 hour)
**Priority: LOW** 🟢

**Setup Resend (Recommended)**

#### Steps:
1. Go to https://resend.com and sign up (free tier)
2. Verify domain or use resend's test domain
3. Get API key
4. Add to .env: `RESEND_API_KEY=your_key_here`
5. Install package: `npm install resend`
6. Create email service in `server/services/email.ts`
7. Create email templates in `server/templates/emails/`
8. Test sending invoice approval notification

**Email Templates Needed:**
- Invoice uploaded (to board members)
- Invoice approved (to uploader)
- Invoice rejected (to uploader with reason)

---

## 📝 **Before You Start Tomorrow**

### Environment Check:
```bash
cd ~/Desktop/Heritage-condo-management
npm run dev
# Verify server starts on http://localhost:5001
```

### Quick Test:
1. Login as board member (board / board1806)
2. Try to view invoices list - should see the bug
3. This confirms what needs to be fixed

---

## 🧪 **Testing Checklist**

After completing tasks, test:

- [ ] Invoice list loads without errors
- [ ] Can view invoice detail
- [ ] Can approve invoice (board only)
- [ ] Can reject invoice with reason (board only)
- [ ] Approval status shows in invoice list
- [ ] Approval history visible on detail page
- [ ] Can upload document with "Assessment" category
- [ ] Can upload document with "Violation" category
- [ ] Can filter documents by new categories
- [ ] Categories show with correct colors/icons

---

## 🚀 **Quick Wins for Future Sessions**

After tomorrow, these are the next quick wins:

**Week 1 Remaining:**
- Mark invoice as paid workflow
- Payment method tracking (check, ACH, wire)
- Payment date recording

**Week 2:**
- Owner payment portal foundation
- Stripe integration setup
- Payment processing logic

**Week 3:**
- Bank reconciliation tool
- Budget vs actual tracking
- Automated financial reports

---

## 💡 **Tips for Success**

1. **Start with the invoice listing fix** - It's the foundation for everything else
2. **Test frequently** - Don't wait until the end to test
3. **Use git commits** - Commit after each task completion
4. **Keep the server running** - Hot reload makes development faster
5. **Check the roadmap** - Reference HERITAGE_VISION_ROADMAP.md for context

---

## 📞 **Support Resources**

- **Stripe Docs:** https://stripe.com/docs/payments
- **Resend Docs:** https://resend.com/docs
- **Plaid Docs:** https://plaid.com/docs/
- **React Query:** https://tanstack.com/query/latest
- **Zod Validation:** https://zod.dev/

---

**You're building something amazing! Each session gets you closer to eliminating the need for external accountants. Let's make Heritage Condo completely self-sufficient! 🚀**
