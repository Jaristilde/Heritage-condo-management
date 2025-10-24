import { storage } from "./storage";
import { hashPassword } from "./auth";

async function seed() {
  console.log("🌱 Starting database seed...");

  // Create default users
  console.log("Creating users...");
  
  const boardPassword = await hashPassword("board123");
  const managementPassword = await hashPassword("management123");
  
  await storage.createUser({
    username: "board",
    password: boardPassword,
    email: "board@heritage-hoa.com",
    role: "board",
    unitId: null,
    active: true,
  });

  await storage.createUser({
    username: "management",
    password: managementPassword,
    email: "management@heritage-hoa.com",
    role: "management",
    unitId: null,
    active: true,
  });

  // Create all 24 units with data from the financial report
  console.log("Creating units...");

  const unitsData = [
    { unitNumber: "201", monthlyMaintenance: "578.45", maintenanceBalance: "578.45", 
      firstAssessmentStatus: "paid", firstAssessmentBalance: "0", 
      secondAssessmentStatus: "paid", secondAssessmentBalance: "-1083.72", 
      totalOwed: "-505.27", delinquencyStatus: "current", priorityLevel: "low",
      ownerName: "Unit 201 Owner", notes: "Overall credit balance" },
    
    { unitNumber: "202", monthlyMaintenance: "200.43", maintenanceBalance: "200.43", 
      firstAssessmentStatus: "paying", firstAssessmentBalance: "0", 
      secondAssessmentStatus: "plan", secondAssessmentBalance: "7194.77", 
      totalOwed: "7395.20", delinquencyStatus: "current", priorityLevel: "low",
      ownerName: "Unit 202 Owner", notes: "3-year payment plan approved" },
    
    { unitNumber: "203", monthlyMaintenance: "128.81", maintenanceBalance: "128.81", 
      firstAssessmentStatus: "paying", firstAssessmentBalance: "0", 
      secondAssessmentStatus: "plan", secondAssessmentBalance: "7859.23", 
      totalOwed: "7988.04", delinquencyStatus: "current", priorityLevel: "low",
      ownerName: "Unit 203 Owner", notes: "3-year payment plan approved" },
    
    { unitNumber: "204", monthlyMaintenance: "3754.27", maintenanceBalance: "3754.27", 
      firstAssessmentStatus: "owed", firstAssessmentBalance: "208", 
      secondAssessmentStatus: "owed", secondAssessmentBalance: "12045.92", 
      totalOwed: "15800.19", delinquencyStatus: "90plus", priorityLevel: "high",
      ownerName: "Unit 204 Owner", notes: "Multiple payment failures" },
    
    { unitNumber: "205", monthlyMaintenance: "0", maintenanceBalance: "-865.70", 
      firstAssessmentStatus: "owed", firstAssessmentBalance: "208", 
      secondAssessmentStatus: "paid", secondAssessmentBalance: "0", 
      totalOwed: "-865.70", delinquencyStatus: "current", priorityLevel: "low",
      ownerName: "Unit 205 Owner", notes: "Credit balance" },
    
    { unitNumber: "206", monthlyMaintenance: "6560.92", maintenanceBalance: "6560.92", 
      firstAssessmentStatus: "paid", firstAssessmentBalance: "0", 
      secondAssessmentStatus: "owed", secondAssessmentBalance: "2717.87", 
      totalOwed: "9278.79", delinquencyStatus: "90plus", priorityLevel: "high",
      ownerName: "Unit 206 Owner", notes: "Significant arrears" },
    
    { unitNumber: "207", monthlyMaintenance: "0", maintenanceBalance: "0", 
      firstAssessmentStatus: "paid", firstAssessmentBalance: "0", 
      secondAssessmentStatus: "owed", secondAssessmentBalance: "7586.04", 
      totalOwed: "7586.04", delinquencyStatus: "pending", priorityLevel: "high",
      ownerName: "Unit 207 Owner", notes: "Large 2nd assessment owed" },
    
    { unitNumber: "208", monthlyMaintenance: "0", maintenanceBalance: "-537.84", 
      firstAssessmentStatus: "owed", firstAssessmentBalance: "208", 
      secondAssessmentStatus: "paid", secondAssessmentBalance: "0", 
      totalOwed: "-537.84", delinquencyStatus: "current", priorityLevel: "low",
      ownerName: "Unit 208 Owner", notes: "Credit balance" },
    
    { unitNumber: "301", monthlyMaintenance: "4820.79", maintenanceBalance: "4820.79", 
      firstAssessmentStatus: "owed", firstAssessmentBalance: "208", 
      secondAssessmentStatus: "owed", secondAssessmentBalance: "1083.72", 
      totalOwed: "5904.51", delinquencyStatus: "90plus", priorityLevel: "high",
      ownerName: "Unit 301 Owner", notes: "Large total owed" },
    
    { unitNumber: "302", monthlyMaintenance: "4049.15", maintenanceBalance: "4049.15", 
      firstAssessmentStatus: "paid", firstAssessmentBalance: "0", 
      secondAssessmentStatus: "owed", secondAssessmentBalance: "5418.60", 
      totalOwed: "9467.75", delinquencyStatus: "pending", priorityLevel: "critical",
      ownerName: "Unit 302 Owner", notes: "Must verify closing payment" },
    
    { unitNumber: "303", monthlyMaintenance: "7875.24", maintenanceBalance: "7875.24", 
      firstAssessmentStatus: "owed", firstAssessmentBalance: "208", 
      secondAssessmentStatus: "owed", secondAssessmentBalance: "3251.16", 
      totalOwed: "11126.40", delinquencyStatus: "90plus", priorityLevel: "high",
      ownerName: "Unit 303 Owner", notes: "Large total owed" },
    
    { unitNumber: "304", monthlyMaintenance: "0", maintenanceBalance: "-130.85", 
      firstAssessmentStatus: "paid", firstAssessmentBalance: "0", 
      secondAssessmentStatus: "owed", secondAssessmentBalance: "3251.16", 
      totalOwed: "3120.31", delinquencyStatus: "pending", priorityLevel: "medium",
      ownerName: "Unit 304 Owner", notes: "Owes 2nd assessment" },
    
    { unitNumber: "305", monthlyMaintenance: "20247.06", maintenanceBalance: "20247.06", 
      firstAssessmentStatus: "owed", firstAssessmentBalance: "208", 
      secondAssessmentStatus: "attorney", secondAssessmentBalance: "10937.20", 
      totalOwed: "31184.26", delinquencyStatus: "attorney", priorityLevel: "attorney",
      ownerName: "Unit 305 Owner", notes: "With Attorney Daniel - Major case" },
    
    { unitNumber: "306", monthlyMaintenance: "1735.35", maintenanceBalance: "1735.35", 
      firstAssessmentStatus: "paid", firstAssessmentBalance: "0", 
      secondAssessmentStatus: "owed", secondAssessmentBalance: "11920.92", 
      totalOwed: "13656.27", delinquencyStatus: "90plus", priorityLevel: "high",
      ownerName: "Unit 306 Owner", notes: "Full 2nd assessment owed" },
    
    { unitNumber: "307", monthlyMaintenance: "7.68", maintenanceBalance: "7.68", 
      firstAssessmentStatus: "paid", firstAssessmentBalance: "0", 
      secondAssessmentStatus: "paid", secondAssessmentBalance: "0", 
      totalOwed: "7.68", delinquencyStatus: "current", priorityLevel: "low",
      ownerName: "Unit 307 Owner", notes: "Excellent unit" },
    
    { unitNumber: "308", monthlyMaintenance: "38690.10", maintenanceBalance: "38690.10", 
      firstAssessmentStatus: "owed", firstAssessmentBalance: "208", 
      secondAssessmentStatus: "attorney", secondAssessmentBalance: "19631.96", 
      totalOwed: "58322.06", delinquencyStatus: "attorney", priorityLevel: "attorney",
      ownerName: "Unit 308 Estate", notes: "Deceased owner - Estate" },
    
    { unitNumber: "401", monthlyMaintenance: "4216.31", maintenanceBalance: "4216.31", 
      firstAssessmentStatus: "owed", firstAssessmentBalance: "208", 
      secondAssessmentStatus: "owed", secondAssessmentBalance: "540.37", 
      totalOwed: "4756.68", delinquencyStatus: "90plus", priorityLevel: "high",
      ownerName: "Unit 401 Owner", notes: "Multiple arrears" },
    
    { unitNumber: "402", monthlyMaintenance: "1281.40", maintenanceBalance: "1281.40", 
      firstAssessmentStatus: "owed", firstAssessmentBalance: "208", 
      secondAssessmentStatus: "owed", secondAssessmentBalance: "1083.72", 
      totalOwed: "2365.12", delinquencyStatus: "30-60days", priorityLevel: "medium",
      ownerName: "Unit 402 Owner", notes: "In collection" },
    
    { unitNumber: "403", monthlyMaintenance: "0", maintenanceBalance: "-50.00", 
      firstAssessmentStatus: "paid", firstAssessmentBalance: "0", 
      secondAssessmentStatus: "paid", secondAssessmentBalance: "0", 
      totalOwed: "-50.00", delinquencyStatus: "current", priorityLevel: "low",
      ownerName: "Unit 403 Owner", notes: "Credit balance" },
    
    { unitNumber: "404", monthlyMaintenance: "0", maintenanceBalance: "-1060.41", 
      firstAssessmentStatus: "paid", firstAssessmentBalance: "0", 
      secondAssessmentStatus: "owed", secondAssessmentBalance: "3251.16", 
      totalOwed: "2190.75", delinquencyStatus: "pending", priorityLevel: "medium",
      ownerName: "Unit 404 Owner", notes: "Owes 2nd assessment" },
    
    { unitNumber: "405", monthlyMaintenance: "20978.75", maintenanceBalance: "20978.75", 
      firstAssessmentStatus: "owed", firstAssessmentBalance: "208", 
      secondAssessmentStatus: "attorney", secondAssessmentBalance: "11920.92", 
      totalOwed: "32899.67", delinquencyStatus: "attorney", priorityLevel: "attorney",
      ownerName: "Unit 405 Owner", notes: "With Attorney Daniel - Major case" },
    
    { unitNumber: "406", monthlyMaintenance: "266.64", maintenanceBalance: "266.64", 
      firstAssessmentStatus: "paid", firstAssessmentBalance: "0", 
      secondAssessmentStatus: "paid", secondAssessmentBalance: "0", 
      totalOwed: "-817.08", delinquencyStatus: "current", priorityLevel: "low",
      ownerName: "Unit 406 Owner", notes: "Credit balance" },
    
    { unitNumber: "407", monthlyMaintenance: "0", maintenanceBalance: "-58.32", 
      firstAssessmentStatus: "paid", firstAssessmentBalance: "0", 
      secondAssessmentStatus: "paid", secondAssessmentBalance: "0", 
      totalOwed: "-58.32", delinquencyStatus: "current", priorityLevel: "low",
      ownerName: "Unit 407 Owner", notes: "Credit balance" },
    
    { unitNumber: "408", monthlyMaintenance: "3541.79", maintenanceBalance: "3541.79", 
      firstAssessmentStatus: "paid", firstAssessmentBalance: "0", 
      secondAssessmentStatus: "paid", secondAssessmentBalance: "0", 
      totalOwed: "3541.79", delinquencyStatus: "pending", priorityLevel: "medium",
      ownerName: "Unit 408 Owner", notes: "Maintenance arrears only" },
  ];

  for (const unitData of unitsData) {
    const { ownerName, ...unitInfo } = unitData;
    const unit = await storage.createUnit(unitInfo);
    
    await storage.createOwner({
      unitId: unit.id,
      fullName: ownerName,
      email: `${unitData.unitNumber}@heritage-hoa.com`,
      phone: null,
      mailingAddress: null,
      isPrimary: true,
      status: unitData.unitNumber === "308" ? "deceased" : "active",
    });

    // Create owner user account for each unit (for login)
    const ownerPassword = await hashPassword("password123");
    await storage.createUser({
      username: `owner${unitData.unitNumber}`,
      password: ownerPassword,
      email: `${unitData.unitNumber}@heritage-hoa.com`,
      role: "owner",
      unitId: unit.id,
      active: true,
    });

    if (unitData.unitNumber === "202" || unitData.unitNumber === "203") {
      await storage.createPaymentPlan({
        unitId: unit.id,
        planType: "second_assessment",
        totalAmount: unitData.secondAssessmentBalance,
        monthlyPayment: "331.31",
        remainingBalance: unitData.secondAssessmentBalance,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2027-01-01"),
        status: "active",
      });
    }
  }

  // Create assessments
  console.log("Creating assessments...");
  
  await storage.createAssessment({
    assessmentName: "First Special Assessment",
    assessmentType: "first",
    totalAmount: "4992.00", // 24 units × $208
    amountPerUnit: "208.00",
    startDate: new Date("2023-08-01"),
    dueDate: null,
    description: "First special assessment for building repairs",
    status: "active",
  });

  await storage.createAssessment({
    assessmentName: "Second Special Assessment",
    assessmentType: "second",
    totalAmount: "286096.80", // Varies by unit
    amountPerUnit: "11920.70", // Average
    startDate: new Date("2024-01-01"),
    dueDate: null,
    description: "Second special assessment for major building improvements",
    status: "active",
  });

  console.log("✅ Database seeded successfully!");
  console.log("\nDefault login credentials:");
  console.log("Board: username: board, password: board123");
  console.log("Management: username: management, password: management123");
  console.log("Owners: username: owner101, owner201, owner202... owner408, password: password123");
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
