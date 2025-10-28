# Heritage Condo - RBAC Implementation

## Overview

This document describes the Role-Based Access Control (RBAC) system implemented for Heritage Condo Management System. The RBAC system ensures proper governance, legal compliance with Florida Statute 718.116, and secure multi-user access.

---

## Role Hierarchy

```
super_admin (Full Access)
  ↓
board_secretary (Financial + Admin)
  ↓
board_treasurer (Financial Focus)
  ↓
board_member (View + Limited Edit)
  ↓
management (Operations Focus)
  ↓
owner (Self-Service Portal)
```

---

## User Accounts

### Current Active Accounts

1. **admin** - Super Administrator
   - Full system access
   - Can modify all records
   - Can manage users and roles

2. **board.secretary** - Board Secretary (Joane Aristilde)
   - Unit: 202
   - Full financial access
   - Can edit and delete records

3. **board.treasurer** - Board Treasurer
   - Financial focus
   - View all, edit financial records

4. **dan.ward** - Board Member (Dan Ward)
   - Units: 205, 208
   - View all units
   - Edit unit information
   - Cannot delete or modify banks

---

## Permission Matrix

### Super Admin (`super_admin`)

**CAN DO:**
- Everything (unrestricted access)
- Manage users and roles
- Delete any records
- Modify bank accounts
- Transfer funds (with Florida law restrictions)
- Access security logs
- Override system settings

**CANNOT DO:**
- Transfer from Reserve → Operating (Florida law)

### Board Secretary (`board_secretary`)

**CAN DO:**
- View all units and financial reports
- Edit and delete units
- Modify bank accounts
- Create and manage assessments
- Process payments
- Generate financial reports
- Manage owner accounts
- Access activity logs

**CANNOT DO:**
- Transfer from Reserve → Operating (Florida law)
- Modify other admins' accounts

### Board Treasurer (`board_treasurer`)

**CAN DO:**
- View all financial data
- Edit financial records
- Process payments
- Generate reports
- View bank balances
- Track assessments

**CANNOT DO:**
- Delete records
- Modify bank accounts
- Transfer funds
- Manage users

### Board Member (`board_member`)

**CAN DO:**
- View all 24 units
- View financial reports (read-only)
- Edit unit information:
  - Unit notes
  - Delinquency status
  - Owner contact info
- Mark assessments as paid
- Send notices to owners
- View bank account balances

**CANNOT DO:**
- Delete units or owners
- Modify bank accounts
- Transfer funds
- Change assessment amounts
- Access security logs
- Modify user roles

### Management (`management`)

**CAN DO:**
- View all units
- Edit unit information
- Record payments
- Update ledger entries
- Process late fees
- Manage maintenance requests
- Handle owner communications
- Process invoices

**CANNOT DO:**
- Modify bank accounts
- Transfer reserve funds
- Delete financial records
- Access board-only reports
- Override Florida compliance

### Owner (`owner`)

**CAN DO:**
- View their own unit
- View payment history
- Submit maintenance requests
- Update contact preferences
- Download statements

**CANNOT DO:**
- View other units
- Access financial reports
- Modify any financial data
- View bank accounts

---

## Florida Law Compliance (FS 718.116)

### Reserve Fund Protection

**ENFORCED FOR ALL ROLES (including super_admin):**

❌ **Prohibited:**
- Transfer FROM reserve TO operating
- Use reserve funds for operating expenses
- Commingle reserve and operating funds

✅ **Allowed:**
- Transfer FROM operating TO reserve
- Use reserve funds for:
  - Capital improvements
  - Deferred maintenance
  - Items in reserve study

### Payment Application Order

**Payments must be applied in statutory order:**
1. Interest
2. Late fees
3. Attorney costs
4. Assessments (oldest first)

❌ Cannot change this order

### Fund Separation

- Regular Monthly Assessments → Operating Fund
- Special Assessments → Designated fund
- Reserve Assessments → Reserve Fund

❌ Cannot commingle funds

---

## Implementation Details

### 1. Database Schema

**Users Table Security Fields:**
```sql
must_change_password BOOLEAN DEFAULT true
login_attempts INTEGER DEFAULT 0
locked_until TIMESTAMP
last_login_at TIMESTAMP
last_login_ip TEXT
password_changed_at TIMESTAMP
updated_at TIMESTAMP DEFAULT NOW()
```

### 2. Middleware

**Location:** `/server/middleware/rbac.ts`

**Key Functions:**
- `requirePermission(...permissions)` - Check user permissions
- `validateFloridaFundTransfer()` - Enforce Florida law
- `requireBankAccountAccess()` - Restrict bank modifications
- `canAccessUnit(userId, unitId)` - Check unit access

**Example Usage:**
```typescript
import { requirePermission, validateFloridaFundTransfer } from "./middleware/rbac";

// View all units - multiple roles
app.get("/api/units",
  requirePermission("view:all_units"),
  getUnits
);

// Edit unit - board members and management
app.put("/api/units/:id",
  requirePermission("edit:unit"),
  updateUnit
);

// Delete unit - super_admin and board_secretary only
app.delete("/api/units/:id",
  requirePermission("delete:unit"),
  deleteUnit
);

// Transfer funds - with Florida law validation
app.post("/api/bank/transfer",
  requirePermission("transfer:funds"),
  validateFloridaFundTransfer(),
  transferFunds
);
```

### 3. Frontend Guards

**Recommended Implementation:**

```typescript
// Check if user can delete
const canDelete = user.role === "super_admin" || user.role === "board_secretary";

// Show/hide delete button
{canDelete && (
  <button onClick={handleDelete}>Delete Unit</button>
)}

// Disable bank account fields for board members
const canEditBanks = user.role === "super_admin";

<input
  disabled={!canEditBanks}
  value={bankAccount.balance}
/>

// Warn on reserve → operating transfer
if (fromAccount === "RESERVE" && toAccount === "OPERATING") {
  alert("Florida Law Violation: Cannot transfer from Reserve to Operating");
  return;
}
```

---

## Testing Permissions

### Test 1: Board Member Can Edit Unit

1. Login as `dan.ward`
2. Navigate to Unit 205
3. Edit unit notes ✅ Should succeed
4. Try to delete unit ❌ Should be blocked

### Test 2: Board Member Cannot Delete

1. Login as `dan.ward`
2. Navigate to any unit
3. Look for delete button ❌ Should not be visible
4. Try API call to delete ❌ Should return 403 Forbidden

### Test 3: Reserve Transfer Blocked

1. Login as `admin`
2. Try to transfer from Reserve → Operating
3. Should be blocked with Florida law error ❌
4. Try Operating → Reserve ✅ Should succeed

### Test 4: Board Member Cannot Modify Banks

1. Login as `dan.ward`
2. Navigate to bank accounts
3. Try to edit account ❌ Should be blocked
4. Can view balances ✅ Should succeed

---

## Security Features

### Password Security

- BCrypt hashing with 12 rounds
- 20-character secure passwords
- Must contain: uppercase, lowercase, numbers, special characters
- Force password change on first login

### Account Locking

- Track failed login attempts
- Lock account after 5 failed attempts
- Unlock after 30 minutes or admin intervention

### Audit Trail

- Track all user actions
- Log IP addresses
- Record password changes
- Monitor failed login attempts

---

## Migration History

### Migration: Add User Security Fields

**File:** `/migrations/add_user_security_fields.sql`

**Date:** 2025-10-27

**Changes:**
- Added `must_change_password` column
- Added `login_attempts` column
- Added `locked_until` column
- Added `last_login_at` column
- Added `last_login_ip` column
- Added `password_changed_at` column
- Added `updated_at` column

**Run with:**
```bash
npx tsx scripts/run-migration.ts
```

---

## Seed Scripts

### Seed Units and Owners

**File:** `/scripts/seed-units-and-owners.ts`

**Purpose:** Create all 24 Heritage Condo units with real owner data

**Run with:**
```bash
npm run seed:units
```

### Seed Board Member

**File:** `/scripts/seed-board-member.ts`

**Purpose:** Create Dan Ward's board member account

**Run with:**
```bash
npm run seed:board
```

**Output:** Displays secure credentials (save immediately!)

---

## Troubleshooting

### Issue: "column 'must_change_password' does not exist"

**Solution:** Run database migration:
```bash
npx tsx scripts/run-migration.ts
```

### Issue: "DATABASE_URL must be set"

**Solution:** Add to top of seed script:
```typescript
import "dotenv/config";
```

### Issue: Permission denied

**Check:**
1. User role in database
2. Middleware applied to route
3. Frontend permission guards

### Issue: Florida law violation not blocking

**Check:**
1. `validateFloridaFundTransfer()` middleware applied
2. Account types are "RESERVE" and "OPERATING" (uppercase)
3. Validation order in middleware stack

---

## Future Enhancements

1. **Activity Logs:** Track all user actions for audit trail
2. **Email Notifications:** Alert board on critical actions
3. **Two-Factor Authentication:** Add 2FA for admin accounts
4. **Session Management:** Implement session timeouts
5. **IP Whitelisting:** Restrict access by IP address
6. **Document Signing:** Digital signatures for board resolutions

---

## Support

For questions or issues:
1. Check this documentation
2. Review `/server/middleware/rbac.ts` for permission logic
3. Test with different user roles
4. Check browser console for error messages

---

**Last Updated:** 2025-10-27
**Version:** 1.0
**Status:** ✅ Production Ready
