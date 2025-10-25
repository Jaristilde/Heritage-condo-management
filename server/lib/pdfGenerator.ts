import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface MonthlyReportData {
  month: number;
  year: number;
  reportDate: Date;
  
  // Balance Sheet
  balanceSheet: {
    assets: {
      operatingCash: number;
      reserveCash: number;
      specialAssessmentCash: number;
      debtServiceCash: number;
      accountsReceivable: number;
      prepaidExpenses: number;
    };
    liabilities: {
      accountsPayable: number;
      accruedExpenses: number;
      deferredRevenue: number;
      loanPayable: number;
    };
    equity: {
      reserveFund: number;
      operatingFund: number;
      retainedEarnings: number;
    };
  };
  
  // Income Statement
  incomeStatement: {
    revenue: {
      maintenanceFees: number;
      firstAssessment: number;
      secondAssessment: number;
      lateFees: number;
      interestIncome: number;
      other: number;
    };
    expenses: Array<{
      category: string;
      actual: number;
      budget: number;
      variance: number;
      variancePercent: number;
    }>;
    netIncome: number;
  };
  
  // Delinquency Report
  delinquencies: Array<{
    unitNumber: string;
    ownerName: string;
    maintenanceBalance: number;
    firstAssessmentBalance: number;
    secondAssessmentBalance: number;
    totalOwed: number;
    status: string;
    daysPastDue: number;
  }>;
  
  // Cash Flow Statement
  cashFlow: {
    operatingActivities: {
      netIncome: number;
      accountsReceivableChange: number;
      accountsPayableChange: number;
      netCashFromOperations: number;
    };
    investingActivities: {
      capitalImprovements: number;
      netCashFromInvesting: number;
    };
    financingActivities: {
      loanProceeds: number;
      loanRepayments: number;
      netCashFromFinancing: number;
    };
    netCashChange: number;
    beginningCash: number;
    endingCash: number;
  };
  
  // Bank Reconciliation
  bankReconciliation: Array<{
    accountName: string;
    bankBalance: number;
    outstandingChecks: Array<{ checkNumber: string; amount: number; payee: string }>;
    depositsInTransit: number;
    bookBalance: number;
    difference: number;
  }>;
  
  // AI Commentary
  aiCommentary: string;
  
  // Summary metrics
  collectionRate: number;
  unitsInArrears: number;
  totalCash: number;
}

export async function generateMonthlyFinancialReport(
  data: MonthlyReportData
): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const monthName = monthNames[data.month - 1];
  const reportTitle = `Financial Report - ${monthName} ${data.year}`;

  // PAGE 1: COVER LETTER
  addCoverPage(doc, monthName, data.year, data);

  // PAGE 2: BALANCE SHEET
  doc.addPage();
  addBalanceSheet(doc, monthName, data.year, data.balanceSheet);

  // PAGE 3: INCOME STATEMENT
  doc.addPage();
  addIncomeStatement(doc, monthName, data.year, data.incomeStatement);

  // PAGE 4: DELINQUENCY REPORT
  doc.addPage();
  addDelinquencyReport(doc, monthName, data.year, data.delinquencies);

  // PAGE 5: CASH FLOW STATEMENT
  doc.addPage();
  addCashFlowStatement(doc, monthName, data.year, data.cashFlow);

  // PAGE 6: BANK RECONCILIATION
  doc.addPage();
  addBankReconciliation(doc, monthName, data.year, data.bankReconciliation);

  // PAGE 7: AI-GENERATED MANAGEMENT DISCUSSION & ANALYSIS
  doc.addPage();
  addManagementCommentary(doc, monthName, data.year, data.aiCommentary);

  return Buffer.from(doc.output("arraybuffer"));
}

function addHeader(doc: jsPDF, title: string) {
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("JUDA & ESKEW, CPAS", 40, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Certified Public Accountants", 40, 52);
  doc.text("Miami, Florida", 40, 62);
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (612 - titleWidth) / 2, 100);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("HERITAGE CONDOMINIUM ASSOCIATION, INC.", 40, 130);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("North Miami, Florida", 40, 145);
}

function addCoverPage(doc: jsPDF, month: string, year: number, data: MonthlyReportData) {
  addHeader(doc, `Monthly Financial Report`);
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`${month} ${year}`, 40, 180);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Report Date: ${new Date(data.reportDate).toLocaleDateString()}`, 40, 210);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", 40, 250);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const summaryLines = [
    `Collection Rate: ${data.collectionRate.toFixed(1)}%`,
    `Units in Arrears: ${data.unitsInArrears} out of 24`,
    `Total Cash Position: $${data.totalCash.toLocaleString()}`,
    `Net Income (Month): $${data.incomeStatement.netIncome.toLocaleString()}`,
  ];
  
  let y = 275;
  summaryLines.forEach(line => {
    doc.text(line, 60, y);
    y += 20;
  });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Report Contents:", 40, 380);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const contents = [
    "Page 1: Cover Letter & Executive Summary",
    "Page 2: Balance Sheet",
    "Page 3: Income Statement (Actual vs. Budget)",
    "Page 4: Delinquency Report",
    "Page 5: Cash Flow Statement",
    "Page 6: Bank Reconciliation",
    "Page 7: Management Discussion & Analysis (AI-Generated)",
  ];
  
  y = 405;
  contents.forEach((item, index) => {
    doc.text(`${index + 1}. ${item}`, 60, y);
    y += 18;
  });
  
  doc.setFontSize(8);
  doc.text(`Prepared by Juda & Eskew, CPAs | ${new Date().toLocaleDateString()}`, 40, 750);
}

function addBalanceSheet(doc: jsPDF, month: string, year: number, bs: MonthlyReportData["balanceSheet"]) {
  addHeader(doc, "Balance Sheet");
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`As of ${month} 30, ${year}`, 40, 170);
  
  const totalAssets = 
    bs.assets.operatingCash +
    bs.assets.reserveCash +
    bs.assets.specialAssessmentCash +
    bs.assets.debtServiceCash +
    bs.assets.accountsReceivable +
    bs.assets.prepaidExpenses;
  
  const totalLiabilities = 
    bs.liabilities.accountsPayable +
    bs.liabilities.accruedExpenses +
    bs.liabilities.deferredRevenue +
    bs.liabilities.loanPayable;
  
  const totalEquity = 
    bs.equity.reserveFund +
    bs.equity.operatingFund +
    bs.equity.retainedEarnings;
  
  autoTable(doc, {
    startY: 190,
    head: [["ASSETS", "Amount"]],
    body: [
      ["Cash and Cash Equivalents:", ""],
      ["  Operating Account - Popular Bank (1343)", `$${bs.assets.operatingCash.toLocaleString()}`],
      ["  Reserve Account - Truist Bank (5602)", `$${bs.assets.reserveCash.toLocaleString()}`],
      ["  Special Assessment Account", `$${bs.assets.specialAssessmentCash.toLocaleString()}`],
      ["  Debt Service Account", `$${bs.assets.debtServiceCash.toLocaleString()}`],
      ["Accounts Receivable - Unit Owners", `$${bs.assets.accountsReceivable.toLocaleString()}`],
      ["Prepaid Expenses", `$${bs.assets.prepaidExpenses.toLocaleString()}`],
      ["", ""],
      ["TOTAL ASSETS", `$${totalAssets.toLocaleString()}`],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [240, 240, 240], fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 350 },
      1: { cellWidth: 100, halign: "right" },
    },
  });
  
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [["LIABILITIES & EQUITY", "Amount"]],
    body: [
      ["Liabilities:", ""],
      ["  Accounts Payable", `$${bs.liabilities.accountsPayable.toLocaleString()}`],
      ["  Accrued Expenses", `$${bs.liabilities.accruedExpenses.toLocaleString()}`],
      ["  Deferred Revenue", `$${bs.liabilities.deferredRevenue.toLocaleString()}`],
      ["  Loan Payable", `$${bs.liabilities.loanPayable.toLocaleString()}`],
      ["", ""],
      ["Total Liabilities", `$${totalLiabilities.toLocaleString()}`],
      ["", ""],
      ["Equity:", ""],
      ["  Reserve Fund", `$${bs.equity.reserveFund.toLocaleString()}`],
      ["  Operating Fund", `$${bs.equity.operatingFund.toLocaleString()}`],
      ["  Retained Earnings", `$${bs.equity.retainedEarnings.toLocaleString()}`],
      ["", ""],
      ["Total Equity", `$${totalEquity.toLocaleString()}`],
      ["", ""],
      ["TOTAL LIABILITIES & EQUITY", `$${(totalLiabilities + totalEquity).toLocaleString()}`],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [240, 240, 240], fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 350 },
      1: { cellWidth: 100, halign: "right" },
    },
  });
}

function addIncomeStatement(doc: jsPDF, month: string, year: number, is: MonthlyReportData["incomeStatement"]) {
  addHeader(doc, "Income Statement");
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`For the Month Ended ${month} 30, ${year}`, 40, 170);
  
  const totalRevenue = 
    is.revenue.maintenanceFees +
    is.revenue.firstAssessment +
    is.revenue.secondAssessment +
    is.revenue.lateFees +
    is.revenue.interestIncome +
    is.revenue.other;
  
  const totalExpenses = is.expenses.reduce((sum, e) => sum + e.actual, 0);
  
  autoTable(doc, {
    startY: 190,
    head: [["REVENUE", "Actual", "Budget", "Variance"]],
    body: [
      ["Maintenance Assessments", `$${is.revenue.maintenanceFees.toLocaleString()}`, "", ""],
      ["First Assessment Payments", `$${is.revenue.firstAssessment.toLocaleString()}`, "", ""],
      ["Second Assessment Payments", `$${is.revenue.secondAssessment.toLocaleString()}`, "", ""],
      ["Late Fees", `$${is.revenue.lateFees.toLocaleString()}`, "", ""],
      ["Interest Income", `$${is.revenue.interestIncome.toLocaleString()}`, "", ""],
      ["Other Income", `$${is.revenue.other.toLocaleString()}`, "", ""],
      ["", "", "", ""],
      ["TOTAL REVENUE", `$${totalRevenue.toLocaleString()}`, "", ""],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [240, 240, 240], fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 250 },
      1: { cellWidth: 90, halign: "right" },
      2: { cellWidth: 90, halign: "right" },
      3: { cellWidth: 90, halign: "right" },
    },
  });
  
  const expenseBody = is.expenses.map(e => [
    e.category,
    `$${e.actual.toLocaleString()}`,
    `$${e.budget.toLocaleString()}`,
    `$${e.variance.toLocaleString()}`,
  ]);
  
  expenseBody.push(["", "", "", ""]);
  expenseBody.push(["TOTAL EXPENSES", `$${totalExpenses.toLocaleString()}`, "", ""]);
  expenseBody.push(["", "", "", ""]);
  expenseBody.push(["NET INCOME", `$${is.netIncome.toLocaleString()}`, "", ""]);
  
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [["EXPENSES", "Actual", "Budget", "Variance"]],
    body: expenseBody,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [240, 240, 240], fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 250 },
      1: { cellWidth: 90, halign: "right" },
      2: { cellWidth: 90, halign: "right" },
      3: { cellWidth: 90, halign: "right" },
    },
  });
}

function addDelinquencyReport(doc: jsPDF, month: string, year: number, delinquencies: MonthlyReportData["delinquencies"]) {
  addHeader(doc, "Delinquency Report");
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`As of ${month} 30, ${year}`, 40, 170);
  
  const tableBody = delinquencies.map(d => [
    d.unitNumber,
    d.ownerName,
    `$${d.totalOwed.toLocaleString()}`,
    d.status,
    `${d.daysPastDue} days`,
  ]);
  
  const totalOwed = delinquencies.reduce((sum, d) => sum + d.totalOwed, 0);
  tableBody.push(["", "TOTAL", `$${totalOwed.toLocaleString()}`, "", ""]);
  
  autoTable(doc, {
    startY: 190,
    head: [["Unit", "Owner", "Amount Owed", "Status", "Days Past Due"]],
    body: tableBody,
    theme: "striped",
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [200, 50, 50], textColor: [255, 255, 255], fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 150 },
      2: { cellWidth: 100, halign: "right" },
      3: { cellWidth: 110 },
      4: { cellWidth: 100, halign: "right" },
    },
  });
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  const y = (doc as any).lastAutoTable.finalY + 20;
  doc.text(`Total Units in Arrears: ${delinquencies.length} out of 24 (${((delinquencies.length / 24) * 100).toFixed(1)}%)`, 40, y);
}

function addCashFlowStatement(doc: jsPDF, month: string, year: number, cf: MonthlyReportData["cashFlow"]) {
  addHeader(doc, "Cash Flow Statement");
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`For the Month Ended ${month} 30, ${year}`, 40, 170);
  
  autoTable(doc, {
    startY: 190,
    body: [
      ["CASH FLOWS FROM OPERATING ACTIVITIES", ""],
      ["  Net Income", `$${cf.operatingActivities.netIncome.toLocaleString()}`],
      ["  Adjustments:", ""],
      ["    Change in Accounts Receivable", `$${cf.operatingActivities.accountsReceivableChange.toLocaleString()}`],
      ["    Change in Accounts Payable", `$${cf.operatingActivities.accountsPayableChange.toLocaleString()}`],
      ["", ""],
      ["  Net Cash from Operating Activities", `$${cf.operatingActivities.netCashFromOperations.toLocaleString()}`],
      ["", ""],
      ["CASH FLOWS FROM INVESTING ACTIVITIES", ""],
      ["  Capital Improvements", `$${cf.investingActivities.capitalImprovements.toLocaleString()}`],
      ["", ""],
      ["  Net Cash from Investing Activities", `$${cf.investingActivities.netCashFromInvesting.toLocaleString()}`],
      ["", ""],
      ["CASH FLOWS FROM FINANCING ACTIVITIES", ""],
      ["  Loan Proceeds", `$${cf.financingActivities.loanProceeds.toLocaleString()}`],
      ["  Loan Repayments", `$${cf.financingActivities.loanRepayments.toLocaleString()}`],
      ["", ""],
      ["  Net Cash from Financing Activities", `$${cf.financingActivities.netCashFromFinancing.toLocaleString()}`],
      ["", ""],
      ["NET CHANGE IN CASH", `$${cf.netCashChange.toLocaleString()}`],
      ["", ""],
      ["Cash at Beginning of Period", `$${cf.beginningCash.toLocaleString()}`],
      ["Cash at End of Period", `$${cf.endingCash.toLocaleString()}`],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 400 },
      1: { cellWidth: 120, halign: "right" },
    },
  });
}

function addBankReconciliation(doc: jsPDF, month: string, year: number, reconciliation: MonthlyReportData["bankReconciliation"]) {
  addHeader(doc, "Bank Reconciliation");
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`As of ${month} 30, ${year}`, 40, 170);
  
  let startY = 190;
  
  reconciliation.forEach((account, index) => {
    if (index > 0) {
      startY = (doc as any).lastAutoTable.finalY + 15;
    }
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(account.accountName, 40, startY);
    
    const checksBody = account.outstandingChecks.map(check => [
      check.checkNumber,
      check.payee,
      `($${check.amount.toLocaleString()})`,
    ]);
    
    const totalOutstanding = account.outstandingChecks.reduce((sum, check) => sum + check.amount, 0);
    
    autoTable(doc, {
      startY: startY + 10,
      body: [
        ["Bank Statement Balance", `$${account.bankBalance.toLocaleString()}`],
        ["Add: Deposits in Transit", `$${account.depositsInTransit.toLocaleString()}`],
        ["Less: Outstanding Checks", `($${totalOutstanding.toLocaleString()})`],
        ["", ""],
        ["Adjusted Bank Balance", `$${account.bookBalance.toLocaleString()}`],
        ["Book Balance", `$${account.bookBalance.toLocaleString()}`],
        ["", ""],
        ["Difference", account.difference === 0 ? "RECONCILED" : `$${account.difference.toLocaleString()}`],
      ],
      theme: "plain",
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 300 },
        1: { cellWidth: 150, halign: "right" },
      },
    });
    
    if (account.outstandingChecks.length > 0) {
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [["Check #", "Payee", "Amount"]],
        body: checksBody,
        theme: "plain",
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [250, 250, 250], fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 250 },
          2: { cellWidth: 120, halign: "right" },
        },
      });
    }
  });
}

function addManagementCommentary(doc: jsPDF, month: string, year: number, commentary: string) {
  addHeader(doc, "Management Discussion & Analysis");
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`${month} ${year} Financial Commentary`, 40, 170);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("Powered by Claude AI (Anthropic)", 40, 185);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const pageWidth = 612;
  const margins = { left: 40, right: 40, top: 200, bottom: 60 };
  const maxWidth = pageWidth - margins.left - margins.right;
  
  const lines = doc.splitTextToSize(commentary, maxWidth);
  
  let y = margins.top;
  const lineHeight = 14;
  
  lines.forEach((line: string) => {
    if (y + lineHeight > 792 - margins.bottom) {
      doc.addPage();
      addHeader(doc, "Management Discussion & Analysis (Continued)");
      y = 170;
    }
    doc.text(line, margins.left, y);
    y += lineHeight;
  });
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("This commentary was generated using AI analysis and should be reviewed by management.", 40, 750);
}
