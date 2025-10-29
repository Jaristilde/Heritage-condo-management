/**
 * QuickBooks Export Utilities
 *
 * Exports financial data in formats compatible with QuickBooks:
 * - IIF (Intuit Interchange Format) for QuickBooks Desktop
 * - CSV for QuickBooks Online or manual import
 */

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date | string;
  vendorId: string;
  vendorName?: string;
  amount: string | number;
  description: string;
  glCode?: string;
  status: string;
}

interface Payment {
  id: string;
  unitId: string;
  unitNumber?: string;
  amount: string | number;
  paymentType: string;
  paymentMethod: string;
  paidAt: Date | string;
}

/**
 * Export invoices to IIF format (QuickBooks Desktop)
 */
export function exportInvoicesToIIF(invoices: Invoice[]): string {
  const lines: string[] = [];

  // IIF Header
  lines.push('!TRNS\tTRNSID\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tDOCNUM\tMEMO');
  lines.push('!SPL\tSPLID\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tDOCNUM\tMEMO');
  lines.push('!ENDTRNS');

  // Export each invoice
  invoices.forEach((invoice, index) => {
    const trnsId = `INV${index + 1}`;
    const date = formatDateForIIF(invoice.invoiceDate);
    const amount = parseFloat(invoice.amount.toString());

    // Transaction line (Accounts Payable)
    lines.push([
      'TRNS',
      trnsId,
      'BILL',
      date,
      'Accounts Payable',
      invoice.vendorName || `Vendor-${invoice.vendorId}`,
      '',
      amount.toFixed(2),
      invoice.invoiceNumber,
      invoice.description || ''
    ].join('\t'));

    // Split line (Expense Account)
    const expenseAccount = invoice.glCode || 'Operating Expenses';
    lines.push([
      'SPL',
      trnsId,
      'BILL',
      date,
      expenseAccount,
      invoice.vendorName || `Vendor-${invoice.vendorId}`,
      '',
      (-amount).toFixed(2),
      invoice.invoiceNumber,
      invoice.description || ''
    ].join('\t'));

    lines.push('ENDTRNS');
  });

  return lines.join('\n');
}

/**
 * Export payments to IIF format (QuickBooks Desktop)
 */
export function exportPaymentsToIIF(payments: Payment[]): string {
  const lines: string[] = [];

  // IIF Header
  lines.push('!TRNS\tTRNSID\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tDOCNUM\tMEMO');
  lines.push('!SPL\tSPLID\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tDOCNUM\tMEMO');
  lines.push('!ENDTRNS');

  // Export each payment
  payments.forEach((payment, index) => {
    const trnsId = `PMT${index + 1}`;
    const date = formatDateForIIF(payment.paidAt);
    const amount = parseFloat(payment.amount.toString());
    const customerName = `Unit ${payment.unitNumber || payment.unitId}`;

    // Transaction line (Bank Account)
    lines.push([
      'TRNS',
      trnsId,
      'DEPOSIT',
      date,
      'Operating Account', // Bank account
      customerName,
      '',
      amount.toFixed(2),
      payment.id.substring(0, 10),
      payment.paymentType
    ].join('\t'));

    // Split line (Income Account)
    const incomeAccount = payment.paymentType === 'maintenance'
      ? 'Maintenance Assessment Income'
      : payment.paymentType === 'first_assessment'
      ? 'First Assessment Income'
      : payment.paymentType === 'second_assessment'
      ? 'Second Assessment Income'
      : 'Other Income';

    lines.push([
      'SPL',
      trnsId,
      'DEPOSIT',
      date,
      incomeAccount,
      customerName,
      '',
      (-amount).toFixed(2),
      payment.id.substring(0, 10),
      payment.paymentType
    ].join('\t'));

    lines.push('ENDTRNS');
  });

  return lines.join('\n');
}

/**
 * Export invoices to CSV format
 */
export function exportInvoicesToCSV(invoices: Invoice[]): string {
  const headers = [
    'Invoice Number',
    'Date',
    'Vendor',
    'Description',
    'Amount',
    'GL Code',
    'Status'
  ];

  const rows = invoices.map(inv => [
    inv.invoiceNumber,
    formatDateForCSV(inv.invoiceDate),
    inv.vendorName || inv.vendorId,
    inv.description || '',
    parseFloat(inv.amount.toString()).toFixed(2),
    inv.glCode || '',
    inv.status
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
}

/**
 * Export payments to CSV format
 */
export function exportPaymentsToCSV(payments: Payment[]): string {
  const headers = [
    'Date',
    'Unit',
    'Payment Type',
    'Method',
    'Amount'
  ];

  const rows = payments.map(pmt => [
    formatDateForCSV(pmt.paidAt),
    pmt.unitNumber || pmt.unitId,
    pmt.paymentType,
    pmt.paymentMethod,
    parseFloat(pmt.amount.toString()).toFixed(2)
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
}

/**
 * Export chart of accounts to IIF format
 */
export function exportChartOfAccountsToIIF(): string {
  const lines: string[] = [];

  // IIF Header
  lines.push('!ACCNT\tNAME\tACCNTTYPE\tDESC');

  // Standard HOA Chart of Accounts
  const accounts = [
    ['Operating Account', 'BANK', 'Primary operating bank account'],
    ['Reserve Account', 'BANK', 'Reserve fund bank account'],
    ['Accounts Receivable', 'AR', 'Owner assessments receivable'],
    ['Accounts Payable', 'AP', 'Vendor invoices payable'],
    ['Maintenance Assessment Income', 'INC', 'Monthly maintenance fees'],
    ['First Assessment Income', 'INC', 'First special assessment'],
    ['Second Assessment Income', 'INC', 'Second special assessment'],
    ['Late Fee Income', 'INC', 'Late payment fees'],
    ['Operating Expenses', 'EXP', 'General operating expenses'],
    ['Property Insurance', 'EXP', 'Building and liability insurance'],
    ['Management Fees', 'EXP', 'Property management fees'],
    ['Utilities - Water/Sewer', 'EXP', 'Water and sewer utilities'],
    ['Utilities - Electricity', 'EXP', 'Electric utilities'],
    ['Elevator Maintenance', 'EXP', 'Elevator service and repairs'],
    ['Landscaping', 'EXP', 'Lawn and landscape maintenance'],
    ['Pool Service', 'EXP', 'Pool cleaning and chemicals'],
    ['Legal Fees', 'EXP', 'Attorney fees'],
    ['Reserve Fund', 'OEQUITY', 'Reserve fund balance'],
    ['Operating Fund', 'OEQUITY', 'Operating fund balance'],
  ];

  accounts.forEach(([name, type, desc]) => {
    lines.push(['ACCNT', name, type, desc].join('\t'));
  });

  return lines.join('\n');
}

/**
 * Helper: Format date for IIF (MM/DD/YYYY)
 */
function formatDateForIIF(date: Date | string): string {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Helper: Format date for CSV (YYYY-MM-DD)
 */
function formatDateForCSV(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}
