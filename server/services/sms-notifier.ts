/**
 * SMS Notification Service
 *
 * Sends SMS notifications to board members when:
 * - New invoices are uploaded and need approval
 * - Invoices are approved or rejected
 * - Delinquency notices
 * - Important board actions
 */

import twilio from "twilio";

/**
 * Create Twilio client
 */
function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn("⚠️ Twilio credentials not configured. SMS notifications disabled.");
    return null;
  }

  return twilio(accountSid, authToken);
}

/**
 * Send SMS notification to board members about new invoice
 */
export async function sendInvoiceApprovalSMS(params: {
  vendorName: string;
  invoiceNumber: string;
  amount: string;
  boardMemberPhones: string[];
}): Promise<boolean> {
  try {
    const client = getTwilioClient();

    if (!client) {
      console.log("📱 Skipping SMS notifications (Twilio not configured)");
      return false;
    }

    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioPhone) {
      console.error("❌ TWILIO_PHONE_NUMBER not configured");
      return false;
    }

    if (!params.boardMemberPhones || params.boardMemberPhones.length === 0) {
      console.log("⚠️ No board member phone numbers found for SMS notification");
      return false;
    }

    const message = `📋 Heritage Condo: New invoice from ${params.vendorName} for $${parseFloat(params.amount).toFixed(2)} awaits your approval. Invoice #${params.invoiceNumber}. Login to review: heritage-condo-management-north-miami.netlify.app/invoices`;

    let sentCount = 0;
    const errors = [];

    for (const phoneNumber of params.boardMemberPhones) {
      try {
        // Format phone number (ensure E.164 format: +1xxxxxxxxxx)
        const formattedPhone = formatPhoneNumber(phoneNumber);

        await client.messages.create({
          body: message,
          from: twilioPhone,
          to: formattedPhone,
        });

        sentCount++;
        console.log(`📱 Sent SMS to ${formattedPhone.slice(-4)}`);
      } catch (error: any) {
        console.error(`❌ Failed to send SMS to ${phoneNumber}:`, error.message);
        errors.push({ phone: phoneNumber, error: error.message });
      }
    }

    console.log(`✅ Sent ${sentCount}/${params.boardMemberPhones.length} SMS notifications`);

    if (errors.length > 0) {
      console.error("SMS errors:", errors);
    }

    return sentCount > 0;

  } catch (error) {
    console.error("❌ Failed to send SMS notifications:", error);
    return false;
  }
}

/**
 * Send SMS notification when invoice is approved
 */
export async function sendInvoiceApprovedSMS(params: {
  vendorName: string;
  invoiceNumber: string;
  amount: string;
  approvedBy: string;
  managementPhone?: string;
}): Promise<boolean> {
  try {
    const client = getTwilioClient();

    if (!client || !params.managementPhone) {
      return false;
    }

    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioPhone) {
      return false;
    }

    const message = `✅ Heritage Condo: Invoice from ${params.vendorName} for $${parseFloat(params.amount).toFixed(2)} has been APPROVED by ${params.approvedBy}. Invoice #${params.invoiceNumber}. Proceed with payment.`;

    const formattedPhone = formatPhoneNumber(params.managementPhone);

    await client.messages.create({
      body: message,
      from: twilioPhone,
      to: formattedPhone,
    });

    console.log(`📱 Sent approval SMS to management`);
    return true;

  } catch (error) {
    console.error("❌ Failed to send approval SMS:", error);
    return false;
  }
}

/**
 * Send SMS notification when invoice is rejected
 */
export async function sendInvoiceRejectedSMS(params: {
  vendorName: string;
  invoiceNumber: string;
  amount: string;
  rejectedBy: string;
  reason: string;
  managementPhone?: string;
}): Promise<boolean> {
  try {
    const client = getTwilioClient();

    if (!client || !params.managementPhone) {
      return false;
    }

    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioPhone) {
      return false;
    }

    const message = `❌ Heritage Condo: Invoice from ${params.vendorName} for $${parseFloat(params.amount).toFixed(2)} has been REJECTED by ${params.rejectedBy}. Invoice #${params.invoiceNumber}. Reason: ${params.reason}`;

    const formattedPhone = formatPhoneNumber(params.managementPhone);

    await client.messages.create({
      body: message,
      from: twilioPhone,
      to: formattedPhone,
    });

    console.log(`📱 Sent rejection SMS to management`);
    return true;

  } catch (error) {
    console.error("❌ Failed to send rejection SMS:", error);
    return false;
  }
}

/**
 * Format phone number to E.164 format (+1xxxxxxxxxx)
 */
function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // If it's 10 digits, assume US number and add +1
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  // If it's 11 digits starting with 1, add +
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }

  // If it already starts with +, return as is
  if (phone.startsWith('+')) {
    return phone;
  }

  // Otherwise, assume it needs +1
  return `+${cleaned}`;
}

/**
 * Send delinquency notice via SMS
 */
export async function sendDelinquencySMS(params: {
  unitNumber: string;
  daysLate: number;
  amountOwed: string;
  ownerPhone: string;
}): Promise<boolean> {
  try {
    const client = getTwilioClient();

    if (!client) {
      return false;
    }

    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioPhone) {
      return false;
    }

    let message = '';

    if (params.daysLate <= 30) {
      message = `Heritage Condo - Unit ${params.unitNumber}: Your account is ${params.daysLate} days past due. Amount owed: $${parseFloat(params.amountOwed).toFixed(2)}. Please remit payment to avoid late fees. Login: heritage-condo-management-north-miami.netlify.app`;
    } else if (params.daysLate <= 60) {
      message = `Heritage Condo - Unit ${params.unitNumber}: URGENT - Your account is ${params.daysLate} days past due. Amount owed: $${parseFloat(params.amountOwed).toFixed(2)} including late fees. Immediate payment required to avoid legal action.`;
    } else {
      message = `Heritage Condo - Unit ${params.unitNumber}: FINAL NOTICE - Your account is ${params.daysLate} days past due. Amount owed: $${parseFloat(params.amountOwed).toFixed(2)}. Attorney referral imminent. Contact board immediately.`;
    }

    const formattedPhone = formatPhoneNumber(params.ownerPhone);

    await client.messages.create({
      body: message,
      from: twilioPhone,
      to: formattedPhone,
    });

    console.log(`📱 Sent delinquency SMS to ${formattedPhone.slice(-4)}`);
    return true;

  } catch (error) {
    console.error("❌ Failed to send delinquency SMS:", error);
    return false;
  }
}
