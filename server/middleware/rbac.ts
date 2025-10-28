import { Request, Response, NextFunction } from "express";

/**
 * Role-Based Access Control (RBAC) Middleware
 *
 * Permissions by Role:
 *
 * SUPER_ADMIN:
 * - Full access to everything
 * - Can modify bank accounts
 * - Can delete any record
 * - Can transfer funds (with Florida law restrictions)
 *
 * BOARD_SECRETARY / BOARD_TREASURER / BOARD_MEMBER:
 * - Can VIEW all units and financial data
 * - Can EDIT unit information (balances, status, notes)
 * - Can APPROVE/REJECT invoices
 * - Can CREATE payments and assessments
 * - CANNOT delete records
 * - CANNOT modify bank accounts
 * - CANNOT transfer reserve → operating funds (Florida FS 718.116)
 *
 * MANAGEMENT:
 * - Can VIEW all units
 * - Can EDIT unit information
 * - Can CREATE invoices and payments
 * - CANNOT approve invoices (board-only)
 * - CANNOT delete records
 * - CANNOT access bank accounts
 *
 * OWNER:
 * - Can VIEW only their own unit(s)
 * - Can VIEW their payment history
 * - CANNOT edit anything
 * - CANNOT access other units
 */

export type UserRole =
  | "super_admin"
  | "board_secretary"
  | "board_treasurer"
  | "board_member"
  | "management"
  | "owner";

export type Permission =
  | "view:all_units"
  | "view:own_unit"
  | "edit:unit"
  | "delete:unit"
  | "create:payment"
  | "approve:invoice"
  | "reject:invoice"
  | "view:bank_accounts"
  | "edit:bank_accounts"
  | "transfer:funds"
  | "delete:any"
  | "view:reports"
  | "create:assessment"
  | "edit:assessment";

/**
 * Role permissions matrix
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    "view:all_units",
    "edit:unit",
    "delete:unit",
    "create:payment",
    "approve:invoice",
    "reject:invoice",
    "view:bank_accounts",
    "edit:bank_accounts",
    "transfer:funds",
    "delete:any",
    "view:reports",
    "create:assessment",
    "edit:assessment",
  ],
  board_secretary: [
    "view:all_units",
    "edit:unit",
    "create:payment",
    "approve:invoice",
    "reject:invoice",
    "view:bank_accounts",
    "view:reports",
    "create:assessment",
    "edit:assessment",
  ],
  board_treasurer: [
    "view:all_units",
    "edit:unit",
    "create:payment",
    "approve:invoice",
    "reject:invoice",
    "view:bank_accounts",
    "view:reports",
    "create:assessment",
    "edit:assessment",
  ],
  board_member: [
    "view:all_units",
    "edit:unit",
    "create:payment",
    "approve:invoice",
    "reject:invoice",
    "view:bank_accounts",
    "view:reports",
  ],
  management: [
    "view:all_units",
    "edit:unit",
    "create:payment",
    "view:reports",
  ],
  owner: [
    "view:own_unit",
  ],
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

/**
 * Middleware to require specific permissions
 *
 * Usage:
 *   app.get("/api/units", authMiddleware, requirePermission("view:all_units"), ...)
 */
export function requirePermission(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !user.role) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required"
      });
    }

    const userRole = user.role as UserRole;

    // Check if user has ALL required permissions
    const hasAllPermissions = permissions.every(permission =>
      hasPermission(userRole, permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Role '${userRole}' does not have permission: ${permissions.join(", ")}`,
        requiredPermissions: permissions,
        userRole: userRole,
      });
    }

    next();
  };
}

/**
 * Middleware to check Florida FS 718.116 compliance for fund transfers
 * BLOCKS reserve → operating transfers for ALL roles
 */
export function validateFloridaFundTransfer() {
  return (req: Request, res: Response, next: NextFunction) => {
    const { fromAccountType, toAccountType } = req.body;

    // PROHIBITED: Reserve → Operating transfer
    if (fromAccountType === "RESERVE" && toAccountType === "OPERATING") {
      return res.status(403).json({
        error: "Florida Law Violation",
        message: "Transfer from Reserve to Operating account is prohibited by Florida Statute 718.116",
        statute: "FS 718.116",
        details: "Reserve funds can only be used for capital expenditures, deferred maintenance, and items specified in the reserve study",
        blocked: true,
      });
    }

    // PROHIBITED: Reserve → Operating transfer (by fundType)
    if (req.body.fromFundType === "reserve" && req.body.toFundType === "operating") {
      return res.status(403).json({
        error: "Florida Law Violation",
        message: "Transfer from Reserve to Operating fund is prohibited by Florida Statute 718.116",
        statute: "FS 718.116",
        blocked: true,
      });
    }

    // WARNING: Using reserve funds (not blocking, just logging)
    if (fromAccountType === "RESERVE" || req.body.fromFundType === "reserve") {
      console.warn("⚠️  WARNING: Reserve fund withdrawal detected");
      console.warn(`   User: ${(req as any).user?.username}`);
      console.warn(`   Amount: ${req.body.amount}`);
      console.warn(`   Purpose: ${req.body.purpose || "Not specified"}`);
      console.warn(`   Florida FS 718.116: Reserve funds must be used for capital/deferred maintenance only`);
    }

    next();
  };
}

/**
 * Middleware to restrict bank account modifications to super_admin only
 */
export function requireBankAccountAccess() {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !user.role) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required"
      });
    }

    if (user.role !== "super_admin") {
      return res.status(403).json({
        error: "Forbidden",
        message: "Only super_admin can modify bank account settings",
        userRole: user.role,
        requiredRole: "super_admin",
      });
    }

    next();
  };
}

/**
 * Helper to check if user can access a specific unit
 * - Owners can only access their own units
 * - Board members and above can access all units
 */
export function canAccessUnit(userRole: UserRole, userUnitId: string | null, requestedUnitId: string): boolean {
  // Super admin, board members, and management can access all units
  if (hasPermission(userRole, "view:all_units")) {
    return true;
  }

  // Owners can only access their own unit
  if (userRole === "owner") {
    return userUnitId === requestedUnitId;
  }

  return false;
}

/**
 * Middleware to validate unit access
 */
export function requireUnitAccess() {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const requestedUnitId = req.params.unitId || req.params.id;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!canAccessUnit(user.role, user.unitId, requestedUnitId)) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You can only access your own unit",
      });
    }

    next();
  };
}
