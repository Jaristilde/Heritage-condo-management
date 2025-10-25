import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import type {
  User, InsertUser,
  Unit, InsertUnit,
  Owner, InsertOwner,
  Payment, InsertPayment,
  PaymentPlan, InsertPaymentPlan,
  Assessment, InsertAssessment,
  Vendor, InsertVendor,
  VendorInvoice, InsertVendorInvoice,
  Document, InsertDocument,
  BoardAction, InsertBoardAction,
  Notification, InsertNotification
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Unit operations
  getAllUnits(): Promise<Unit[]>;
  getUnit(id: string): Promise<Unit | undefined>;
  getUnitByNumber(unitNumber: string): Promise<Unit | undefined>;
  createUnit(unit: InsertUnit): Promise<Unit>;
  updateUnit(id: string, unit: Partial<InsertUnit>): Promise<Unit | undefined>;
  
  // Owner operations
  getOwnersByUnit(unitId: string): Promise<Owner[]>;
  getOwner(id: string): Promise<Owner | undefined>;
  createOwner(owner: InsertOwner): Promise<Owner>;
  updateOwner(id: string, owner: Partial<InsertOwner>): Promise<Owner | undefined>;
  
  // Payment operations
  getAllPayments(): Promise<Payment[]>;
  getPaymentsByUnit(unitId: string): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  
  // Payment plan operations
  getPaymentPlansByUnit(unitId: string): Promise<PaymentPlan[]>;
  createPaymentPlan(plan: InsertPaymentPlan): Promise<PaymentPlan>;
  updatePaymentPlan(id: string, plan: Partial<InsertPaymentPlan>): Promise<PaymentPlan | undefined>;
  
  // Assessment operations
  getAllAssessments(): Promise<Assessment[]>;
  getAssessment(id: string): Promise<Assessment | undefined>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  
  // Vendor operations
  getAllVendors(): Promise<Vendor[]>;
  getVendor(id: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(id: string): Promise<void>;
  
  // Vendor Invoice operations
  getAllVendorInvoices(): Promise<VendorInvoice[]>;
  getVendorInvoice(id: string): Promise<VendorInvoice | undefined>;
  getVendorInvoicesByVendor(vendorId: string): Promise<VendorInvoice[]>;
  getVendorInvoicesByStatus(status: string): Promise<VendorInvoice[]>;
  createVendorInvoice(invoice: InsertVendorInvoice): Promise<VendorInvoice>;
  updateVendorInvoice(id: string, invoice: Partial<InsertVendorInvoice>): Promise<VendorInvoice | undefined>;
  deleteVendorInvoice(id: string): Promise<void>;
  
  // Document operations
  getDocuments(relatedTo?: string, relatedId?: string): Promise<Document[]>;
  createDocument(doc: InsertDocument): Promise<Document>;
  
  // Board action operations
  getAllBoardActions(): Promise<BoardAction[]>;
  createBoardAction(action: InsertBoardAction): Promise<BoardAction>;
  updateBoardAction(id: string, action: Partial<InsertBoardAction>): Promise<BoardAction | undefined>;
  
  // Notification operations
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;
  
  // Dashboard statistics
  getDashboardStats(): Promise<{
    totalOutstanding: number;
    unitsInArrears: number;
    attorneyUnits: number;
    monthlyRevenue: number;
    collectionRate: number;
  }>;
}

export class DbStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(schema.users)
      .set(user)
      .where(eq(schema.users.id, id))
      .returning();
    return result[0];
  }

  // Unit operations
  async getAllUnits(): Promise<Unit[]> {
    return db.select().from(schema.units).orderBy(schema.units.unitNumber);
  }

  async getUnit(id: string): Promise<Unit | undefined> {
    const result = await db.select().from(schema.units).where(eq(schema.units.id, id));
    return result[0];
  }

  async getUnitByNumber(unitNumber: string): Promise<Unit | undefined> {
    const result = await db.select().from(schema.units).where(eq(schema.units.unitNumber, unitNumber));
    return result[0];
  }

  async createUnit(unit: InsertUnit): Promise<Unit> {
    const result = await db.insert(schema.units).values(unit).returning();
    return result[0];
  }

  async updateUnit(id: string, unit: Partial<InsertUnit>): Promise<Unit | undefined> {
    const result = await db.update(schema.units)
      .set({ ...unit, updatedAt: new Date() })
      .where(eq(schema.units.id, id))
      .returning();
    return result[0];
  }

  // Owner operations
  async getOwnersByUnit(unitId: string): Promise<Owner[]> {
    return db.select().from(schema.owners).where(eq(schema.owners.unitId, unitId));
  }

  async getOwner(id: string): Promise<Owner | undefined> {
    const result = await db.select().from(schema.owners).where(eq(schema.owners.id, id));
    return result[0];
  }

  async createOwner(owner: InsertOwner): Promise<Owner> {
    const result = await db.insert(schema.owners).values(owner).returning();
    return result[0];
  }

  async updateOwner(id: string, owner: Partial<InsertOwner>): Promise<Owner | undefined> {
    const result = await db.update(schema.owners)
      .set(owner)
      .where(eq(schema.owners.id, id))
      .returning();
    return result[0];
  }

  // Payment operations
  async getAllPayments(): Promise<Payment[]> {
    return db.select().from(schema.payments).orderBy(desc(schema.payments.paidAt));
  }

  async getPaymentsByUnit(unitId: string): Promise<Payment[]> {
    return db.select()
      .from(schema.payments)
      .where(eq(schema.payments.unitId, unitId))
      .orderBy(desc(schema.payments.paidAt));
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const result = await db.select().from(schema.payments).where(eq(schema.payments.id, id));
    return result[0];
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const result = await db.insert(schema.payments).values(payment).returning();
    return result[0];
  }

  // Payment plan operations
  async getPaymentPlansByUnit(unitId: string): Promise<PaymentPlan[]> {
    return db.select()
      .from(schema.paymentPlans)
      .where(eq(schema.paymentPlans.unitId, unitId));
  }

  async createPaymentPlan(plan: InsertPaymentPlan): Promise<PaymentPlan> {
    const result = await db.insert(schema.paymentPlans).values(plan).returning();
    return result[0];
  }

  async updatePaymentPlan(id: string, plan: Partial<InsertPaymentPlan>): Promise<PaymentPlan | undefined> {
    const result = await db.update(schema.paymentPlans)
      .set(plan)
      .where(eq(schema.paymentPlans.id, id))
      .returning();
    return result[0];
  }

  // Assessment operations
  async getAllAssessments(): Promise<Assessment[]> {
    return db.select().from(schema.assessments).orderBy(desc(schema.assessments.startDate));
  }

  async getAssessment(id: string): Promise<Assessment | undefined> {
    const result = await db.select().from(schema.assessments).where(eq(schema.assessments.id, id));
    return result[0];
  }

  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const result = await db.insert(schema.assessments).values(assessment).returning();
    return result[0];
  }

  // Vendor operations
  async getAllVendors(): Promise<Vendor[]> {
    return db.select().from(schema.vendors).orderBy(schema.vendors.vendorName);
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    const result = await db.select().from(schema.vendors).where(eq(schema.vendors.id, id));
    return result[0];
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const result = await db.insert(schema.vendors).values(vendor).returning();
    return result[0];
  }

  async updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const result = await db.update(schema.vendors)
      .set(vendor)
      .where(eq(schema.vendors.id, id))
      .returning();
    return result[0];
  }

  async deleteVendor(id: string): Promise<void> {
    await db.delete(schema.vendors).where(eq(schema.vendors.id, id));
  }

  // Vendor Invoice operations
  async getAllVendorInvoices(): Promise<VendorInvoice[]> {
    return db.select().from(schema.vendorInvoices).orderBy(desc(schema.vendorInvoices.invoiceDate));
  }

  async getVendorInvoice(id: string): Promise<VendorInvoice | undefined> {
    const result = await db.select().from(schema.vendorInvoices).where(eq(schema.vendorInvoices.id, id));
    return result[0];
  }

  async getVendorInvoicesByVendor(vendorId: string): Promise<VendorInvoice[]> {
    return db.select()
      .from(schema.vendorInvoices)
      .where(eq(schema.vendorInvoices.vendorId, vendorId))
      .orderBy(desc(schema.vendorInvoices.invoiceDate));
  }

  async getVendorInvoicesByStatus(status: string): Promise<VendorInvoice[]> {
    return db.select()
      .from(schema.vendorInvoices)
      .where(eq(schema.vendorInvoices.status, status))
      .orderBy(desc(schema.vendorInvoices.invoiceDate));
  }

  async createVendorInvoice(invoice: InsertVendorInvoice): Promise<VendorInvoice> {
    const result = await db.insert(schema.vendorInvoices).values(invoice).returning();
    return result[0];
  }

  async updateVendorInvoice(id: string, invoice: Partial<InsertVendorInvoice>): Promise<VendorInvoice | undefined> {
    const result = await db.update(schema.vendorInvoices)
      .set(invoice)
      .where(eq(schema.vendorInvoices.id, id))
      .returning();
    return result[0];
  }

  async deleteVendorInvoice(id: string): Promise<void> {
    await db.delete(schema.vendorInvoices).where(eq(schema.vendorInvoices.id, id));
  }

  // Document operations
  async getDocuments(relatedTo?: string, relatedId?: string): Promise<Document[]> {
    if (relatedTo && relatedId) {
      return db.select()
        .from(schema.documents)
        .where(
          and(
            eq(schema.documents.relatedTo, relatedTo),
            eq(schema.documents.relatedId, relatedId)
          )
        )
        .orderBy(desc(schema.documents.uploadedAt));
    }
    return db.select().from(schema.documents).orderBy(desc(schema.documents.uploadedAt));
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const result = await db.insert(schema.documents).values(doc).returning();
    return result[0];
  }

  // Board action operations
  async getAllBoardActions(): Promise<BoardAction[]> {
    return db.select().from(schema.boardActions).orderBy(desc(schema.boardActions.createdAt));
  }

  async createBoardAction(action: InsertBoardAction): Promise<BoardAction> {
    const result = await db.insert(schema.boardActions).values(action).returning();
    return result[0];
  }

  async updateBoardAction(id: string, action: Partial<InsertBoardAction>): Promise<BoardAction | undefined> {
    const result = await db.update(schema.boardActions)
      .set(action)
      .where(eq(schema.boardActions.id, id))
      .returning();
    return result[0];
  }

  // Notification operations
  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return db.select()
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, userId))
      .orderBy(desc(schema.notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(schema.notifications).values(notification).returning();
    return result[0];
  }

  async markNotificationRead(id: string): Promise<void> {
    await db.update(schema.notifications)
      .set({ isRead: true })
      .where(eq(schema.notifications.id, id));
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{
    totalOutstanding: number;
    unitsInArrears: number;
    attorneyUnits: number;
    monthlyRevenue: number;
    collectionRate: number;
  }> {
    const units = await this.getAllUnits();
    
    const totalOutstanding = units.reduce((sum, unit) => {
      return sum + parseFloat(unit.totalOwed);
    }, 0);

    const unitsInArrears = units.filter(u => 
      parseFloat(u.totalOwed) > 0 && 
      u.delinquencyStatus !== 'current'
    ).length;

    const attorneyUnits = units.filter(u => 
      u.delinquencyStatus === 'attorney'
    ).length;

    const monthlyRevenue = units.reduce((sum, unit) => {
      return sum + parseFloat(unit.monthlyMaintenance);
    }, 0);

    const currentUnits = units.filter(u => 
      u.delinquencyStatus === 'current' || parseFloat(u.totalOwed) === 0
    ).length;

    const collectionRate = units.length > 0 
      ? (currentUnits / units.length) * 100 
      : 0;

    return {
      totalOutstanding,
      unitsInArrears,
      attorneyUnits,
      monthlyRevenue,
      collectionRate
    };
  }
}

export const storage = new DbStorage();
