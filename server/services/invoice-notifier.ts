/**
 * Invoice Email Notification Service
 *
 * Sends email notifications to board members when:
 * - New invoices are uploaded and need approval
 * - Invoices are approved or rejected
 */

import nodemailer from "nodemailer";

/**
 * Create email transporter
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send email notification to board members about new invoice
 */
export async function sendInvoiceApprovalRequest(params: {
  vendorName: string;
  invoiceNumber: string;
  amount: string;
  invoiceDate: Date;
  dueDate: Date;
  description?: string;
  boardMemberEmails: string[];
}): Promise<boolean> {
  try {
    if (!params.boardMemberEmails || params.boardMemberEmails.length === 0) {
      console.log("⚠️ No board member emails found for invoice notification");
      return false;
    }

    const subject = `📋 New Invoice Awaiting Approval - ${params.vendorName}`;

    const body = `
Dear Heritage Condominium Board Members,

A new invoice has been uploaded and requires your approval.

INVOICE DETAILS:
• Vendor: ${params.vendorName}
• Invoice Number: ${params.invoiceNumber}
• Amount: $${parseFloat(params.amount).toFixed(2)}
• Invoice Date: ${new Date(params.invoiceDate).toLocaleDateString()}
• Due Date: ${new Date(params.dueDate).toLocaleDateString()}
${params.description ? `• Description: ${params.description}` : ''}

ACTION REQUIRED:
Please review and approve or reject this invoice at your earliest convenience.

Review Invoice:
heritage-condo-management-north-miami.netlify.app/invoices

To approve or reject this invoice:
1. Log in to the Heritage Condo Management portal
2. Navigate to Invoice Management
3. Click on the invoice to review details
4. Click "Approve" or "Reject" with your comments

Please note: Invoices should be reviewed within 5 business days to ensure timely payment to vendors.

---
Heritage Condominium Association
Automated Invoice Management System
    `.trim();

    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Heritage Condo Board" <board@heritagecondo.com>',
      to: params.boardMemberEmails.join(", "),
      subject,
      text: body,
    });

    console.log(`✉️ Sent invoice approval request to ${params.boardMemberEmails.length} board members: ${info.messageId}`);
    return true;

  } catch (error) {
    console.error("❌ Failed to send invoice approval notification:", error);
    return false;
  }
}

/**
 * Send email notification when invoice is approved
 */
export async function sendInvoiceApprovedNotification(params: {
  vendorName: string;
  invoiceNumber: string;
  amount: string;
  approvedBy: string;
  managementEmail?: string;
}): Promise<boolean> {
  try {
    if (!params.managementEmail) {
      console.log("⚠️ No management email found for approval notification");
      return false;
    }

    const subject = `✅ Invoice Approved - ${params.vendorName}`;

    const body = `
Dear Management Team,

An invoice has been approved by the board and is ready for payment processing.

INVOICE DETAILS:
• Vendor: ${params.vendorName}
• Invoice Number: ${params.invoiceNumber}
• Amount: $${parseFloat(params.amount).toFixed(2)}
• Approved By: ${params.approvedBy}

NEXT STEPS:
Please proceed with payment processing according to association procedures.

View Invoice:
heritage-condo-management-north-miami.netlify.app/invoices

---
Heritage Condominium Association
Automated Invoice Management System
    `.trim();

    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Heritage Condo Board" <board@heritagecondo.com>',
      to: params.managementEmail,
      subject,
      text: body,
    });

    console.log(`✉️ Sent invoice approval confirmation: ${info.messageId}`);
    return true;

  } catch (error) {
    console.error("❌ Failed to send approval notification:", error);
    return false;
  }
}

/**
 * Send email notification when invoice is rejected
 */
export async function sendInvoiceRejectedNotification(params: {
  vendorName: string;
  invoiceNumber: string;
  amount: string;
  rejectedBy: string;
  reason: string;
  managementEmail?: string;
}): Promise<boolean> {
  try {
    if (!params.managementEmail) {
      console.log("⚠️ No management email found for rejection notification");
      return false;
    }

    const subject = `❌ Invoice Rejected - ${params.vendorName}`;

    const body = `
Dear Management Team,

An invoice has been rejected by the board.

INVOICE DETAILS:
• Vendor: ${params.vendorName}
• Invoice Number: ${params.invoiceNumber}
• Amount: $${parseFloat(params.amount).toFixed(2)}
• Rejected By: ${params.rejectedBy}

REJECTION REASON:
${params.reason}

NEXT STEPS:
Please review the rejection reason and take appropriate action (e.g., contact vendor, re-submit corrected invoice, etc.).

View Invoice:
heritage-condo-management-north-miami.netlify.app/invoices

---
Heritage Condominium Association
Automated Invoice Management System
    `.trim();

    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Heritage Condo Board" <board@heritagecondo.com>',
      to: params.managementEmail,
      subject,
      text: body,
    });

    console.log(`✉️ Sent invoice rejection notification: ${info.messageId}`);
    return true;

  } catch (error) {
    console.error("❌ Failed to send rejection notification:", error);
    return false;
  }
}
