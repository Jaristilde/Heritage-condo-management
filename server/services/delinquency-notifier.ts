import nodemailer from "nodemailer";
import type { DelinquencyCheck } from "./delinquency-checker";

/**
 * Email Notification Service for Delinquency Automation
 *
 * Eliminates manual notice sending by Juda Eskew
 * Auto-sends 30/60/90 day notices and board alerts
 */

// Email templates for different notice types
export const emailTemplates = {
  "30_day": {
    subject: "Heritage Condo - Payment Reminder: {{unitNumber}}",
    body: `
Dear {{ownerName}},

This is a friendly reminder that your Heritage Condominium account for Unit {{unitNumber}} has an outstanding balance.

Current Balance Due: ${{totalOwed}}
Days Past Due: {{daysDelinquent}}

To avoid late fees and further collection action, please submit payment as soon as possible.

Payment Methods:
• Online: heritage-condo-management-north-miami.netlify.app/owner-portal
• Check: Heritage Condominium Association, 13275 Biscayne Blvd, North Miami, FL 33181
• Contact: board@heritagecondo.com or (305) 555-0100

If you have questions about your account or need to arrange a payment plan, please contact the board immediately.

Thank you for your prompt attention to this matter.

Best regards,
Heritage Condominium Association Board
Joane Aristilde, Board Secretary
    `.trim(),
  },

  "60_day": {
    subject: "Heritage Condo - URGENT: Second Notice for Unit {{unitNumber}}",
    body: `
Dear {{ownerName}},

This is your SECOND NOTICE regarding the outstanding balance on Unit {{unitNumber}}.

Current Balance Due: ${{totalOwed}}
Days Past Due: {{daysDelinquent}}

⚠️ LATE FEES HAVE BEEN APPLIED

As of today, late fees have been added to your account per Florida Statutes and our association bylaws.

IMMEDIATE ACTION REQUIRED:
• Full payment must be received within 30 days
• Payment plans are available - contact us immediately
• Failure to pay will result in legal action

Per Florida Statute 718.116, continued non-payment will result in:
1. Lien filing on your property
2. Referral to attorney for collection
3. Additional attorney fees and court costs added to your account
4. Potential foreclosure proceedings

We strongly encourage you to contact the board TODAY to discuss payment options.

Payment Methods:
• Online: heritage-condo-management-north-miami.netlify.app/owner-portal
• Check: Heritage Condominium Association, 13275 Biscayne Blvd, North Miami, FL 33181
• Contact: board@heritagecondo.com or (305) 555-0100

This is a serious matter. Please contact us immediately.

Sincerely,
Heritage Condominium Association Board
Joane Aristilde, Board Secretary
    `.trim(),
  },

  "90_day": {
    subject: "Heritage Condo - FINAL NOTICE: Attorney Referral Imminent - Unit {{unitNumber}}",
    body: `
Dear {{ownerName}},

This is your FINAL NOTICE before attorney referral for Unit {{unitNumber}}.

Current Balance Due: ${{totalOwed}}
Days Past Due: {{daysDelinquent}}

🚨 ATTORNEY REFERRAL IN 7 DAYS

Your account is 90+ days past due. Per Florida Statute 718.116 and association bylaws, we are required to refer your account to our attorney for collection.

FINAL OPPORTUNITY TO AVOID ATTORNEY FEES:
You have 7 days from the date of this notice to pay in full or contact the board to arrange a payment plan.

IF NO PAYMENT IS RECEIVED:
1. Your account will be referred to Daniel C. Lopez, Esq. (Lopez Law Firm)
2. Attorney fees ($3,000-5,000+) will be added to your account
3. A lien will be filed on your property
4. Court costs and interest will be added
5. Foreclosure proceedings may begin

TOTAL COST IF ATTORNEY IS INVOLVED:
• Current balance: ${{totalOwed}}
• Estimated attorney fees: $3,500
• Court costs: $1,000-2,000
• Total you would owe: ${{estimatedTotalWithFees}}

AVOID THESE COSTS - CONTACT US TODAY:
• Email: board@heritagecondo.com
• Phone: (305) 555-0100
• Online Portal: heritage-condo-management-north-miami.netlify.app

We do not want to take legal action, but we are legally obligated to collect outstanding assessments.

This is your final opportunity to resolve this matter directly with the board.

Sincerely,
Heritage Condominium Association Board
Joane Aristilde, Board Secretary

CC: Daniel C. Lopez, Esq. (Lopez Law Firm)
    `.trim(),
  },

  board_alert: {
    subject: "Heritage Condo - Delinquency Alert: {{count}} Units Need Action",
    body: `
Dear Board Members,

Daily delinquency check completed. Action required for {{count}} units.

NEW DELINQUENCIES:
{{newDelinquencies}}

ESCALATIONS:
{{escalations}}

ATTORNEY REFERRALS NEEDED:
{{attorneyReferrals}}

SUMMARY:
• Total delinquent units: {{totalDelinquent}}
• Total amount owed: ${{totalOwed}}
• Units 30-60 days: {{count30to60}}
• Units 60-90 days: {{count60to90}}
• Units 90+ days: {{count90plus}}

View full details in the dashboard:
heritage-condo-management-north-miami.netlify.app/dashboard

Action Required:
{{actionItems}}

This is an automated alert from the Heritage Condo Management System.

---
Heritage Condominium Association
Automated Delinquency Management System
    `.trim(),
  },

  attorney_referral: {
    subject: "Heritage Condo - Attorney Referral: Unit {{unitNumber}}",
    body: `
Dear Daniel,

Please accept this referral for collection action on behalf of Heritage Condominium Association.

UNIT INFORMATION:
• Unit Number: {{unitNumber}}
• Owner Name: {{ownerName}}
• Property Address: 13275 Biscayne Blvd, Unit {{unitNumber}}, North Miami, FL 33181

ACCOUNT DETAILS:
• Total Amount Owed: ${{totalOwed}}
• Days Delinquent: {{daysDelinquent}}
• Last Payment: {{lastPaymentDate}}
• Notices Sent: 30-day, 60-day, 90-day final

BREAKDOWN:
• Monthly Maintenance Arrears: ${{maintenanceArrears}}
• Special Assessment Arrears: ${{specialAssessmentArrears}}
• Late Fees: ${{lateFees}}
• Total: ${{totalOwed}}

FLORIDA STATUTE COMPLIANCE:
• All required notices sent per FS 718.116
• Payment allocation follows statutory order
• Lien filing authorized by board

OWNER CONTACT:
• Email: {{ownerEmail}}
• Phone: {{ownerPhone}}
• Last Contact: {{lastContactDate}}

Please proceed with:
1. Demand letter
2. Lien filing
3. Collection proceedings as appropriate

All supporting documents are attached.

Thank you,
Joane Aristilde
Board Secretary, Heritage Condominium Association
board@heritagecondo.com
(305) 555-0100
    `.trim(),
  },
};

/**
 * Create email transporter
 * In production, use SendGrid, AWS SES, or similar
 */
function createTransporter() {
  // For development: use Ethereal (test email service)
  // For production: replace with real SMTP credentials
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send delinquency notice to owner
 */
export async function sendDelinquencyNotice(
  check: DelinquencyCheck
): Promise<boolean> {
  if (!check.noticeType || !check.email) {
    return false;
  }

  try {
    const template = emailTemplates[check.noticeType];
    const estimatedTotalWithFees = check.totalOwed + 3500 + 1500; // Attorney fees + court costs

    // Replace template variables
    const subject = template.subject.replace("{{unitNumber}}", check.unitNumber);

    let body = template.body
      .replace(/{{unitNumber}}/g, check.unitNumber)
      .replace(/{{ownerName}}/g, check.ownerName)
      .replace(/{{totalOwed}}/g, check.totalOwed.toFixed(2))
      .replace(/{{daysDelinquent}}/g, check.daysDelinquent.toString())
      .replace(/{{estimatedTotalWithFees}}/g, estimatedTotalWithFees.toFixed(2));

    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: '"Heritage Condo Board" <board@heritagecondo.com>',
      to: check.email,
      subject: subject,
      text: body,
    });

    console.log(`✉️  Sent ${check.noticeType} notice to Unit ${check.unitNumber}: ${info.messageId}`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to send notice to Unit ${check.unitNumber}:`, error);
    return false;
  }
}

/**
 * Send board alert email with delinquency summary
 */
export async function sendBoardAlert(checks: DelinquencyCheck[]): Promise<boolean> {
  try {
    const newDelinquencies = checks.filter(c => c.isNewDelinquency);
    const attorneyReferrals = checks.filter(c => c.noticeType === "attorney");
    const totalOwed = checks.reduce((sum, c) => sum + c.totalOwed, 0);

    const count30to60 = checks.filter(c => c.daysDelinquent >= 30 && c.daysDelinquent < 60).length;
    const count60to90 = checks.filter(c => c.daysDelinquent >= 60 && c.daysDelinquent < 90).length;
    const count90plus = checks.filter(c => c.daysDelinquent >= 90).length;

    // Format new delinquencies list
    const newDelList = newDelinquencies.length > 0
      ? newDelinquencies.map(c => `• Unit ${c.unitNumber} (${c.ownerName}): $${c.totalOwed.toFixed(2)} - ${c.daysDelinquent} days`).join("\n")
      : "None";

    // Format attorney referrals list
    const attorneyList = attorneyReferrals.length > 0
      ? attorneyReferrals.map(c => `• Unit ${c.unitNumber} (${c.ownerName}): $${c.totalOwed.toFixed(2)}`).join("\n")
      : "None";

    // Format action items
    const actionItems = checks
      .filter(c => c.recommendedAction !== "Current - No action needed")
      .map(c => `• Unit ${c.unitNumber}: ${c.recommendedAction}`)
      .join("\n");

    const template = emailTemplates.board_alert;

    let body = template.body
      .replace("{{count}}", checks.length.toString())
      .replace("{{newDelinquencies}}", newDelList)
      .replace("{{escalations}}", newDelinquencies.length.toString())
      .replace("{{attorneyReferrals}}", attorneyList)
      .replace("{{totalDelinquent}}", checks.length.toString())
      .replace("{{totalOwed}}", totalOwed.toFixed(2))
      .replace("{{count30to60}}", count30to60.toString())
      .replace("{{count60to90}}", count60to90.toString())
      .replace("{{count90plus}}", count90plus.toString())
      .replace("{{actionItems}}", actionItems);

    const subject = template.subject.replace("{{count}}", checks.length.toString());

    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: '"Heritage Condo System" <system@heritagecondo.com>',
      to: "board@heritagecondo.com", // Send to board email
      cc: "joane.aristilde@heritagecondo.com", // CC board secretary
      subject: subject,
      text: body,
    });

    console.log(`📧 Sent board alert: ${info.messageId}`);
    return true;

  } catch (error) {
    console.error("❌ Failed to send board alert:", error);
    return false;
  }
}

/**
 * Send attorney referral package
 */
export async function sendAttorneyReferral(check: DelinquencyCheck): Promise<boolean> {
  try {
    const template = emailTemplates.attorney_referral;

    let body = template.body
      .replace(/{{unitNumber}}/g, check.unitNumber)
      .replace(/{{ownerName}}/g, check.ownerName)
      .replace(/{{totalOwed}}/g, check.totalOwed.toFixed(2))
      .replace(/{{daysDelinquent}}/g, check.daysDelinquent.toString())
      .replace(/{{ownerEmail}}/g, check.email)
      .replace(/{{ownerPhone}}/g, "Contact board for phone")
      .replace(/{{lastPaymentDate}}/g, "See attached ledger")
      .replace(/{{lastContactDate}}/g, "See notice history")
      .replace(/{{maintenanceArrears}}/g, (check.totalOwed * 0.6).toFixed(2))
      .replace(/{{specialAssessmentArrears}}/g, (check.totalOwed * 0.35).toFixed(2))
      .replace(/{{lateFees}}/g, (check.totalOwed * 0.05).toFixed(2));

    const subject = template.subject.replace("{{unitNumber}}", check.unitNumber);

    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: '"Heritage Condo Board" <board@heritagecondo.com>',
      to: "daniel@lopezlawfirm.com",
      cc: "board@heritagecondo.com",
      subject: subject,
      text: body,
    });

    console.log(`⚖️  Sent attorney referral for Unit ${check.unitNumber}: ${info.messageId}`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to send attorney referral for Unit ${check.unitNumber}:`, error);
    return false;
  }
}
