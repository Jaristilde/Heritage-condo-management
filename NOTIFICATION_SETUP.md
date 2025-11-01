# Email & SMS Notification Setup Guide

Complete guide to configure email and SMS notifications for invoice approvals, delinquency notices, and board communications.

---

## Part 1: Email Notifications (SMTP with Gmail)

### Step 1: Create Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. In the left navigation, click **Security**
3. Scroll down to **2-Step Verification** and click it
   - If 2-Step Verification is OFF, you must turn it ON first
   - Follow the prompts to set it up (you'll need your phone)
4. Once 2-Step Verification is ON, go back to **Security**
5. Scroll down to **2-Step Verification** again and click it
6. Scroll to the bottom and click **App passwords**
7. Enter your password when prompted
8. In the "Select app" dropdown, choose **Mail**
9. In the "Select device" dropdown, choose **Other (Custom name)**
10. Type: **Heritage Condo Management**
11. Click **Generate**
12. **IMPORTANT**: Copy the 16-character app password (example: `abcd efgh ijkl mnop`)
    - Remove the spaces:` abcdefghijklmnop`
    - Save it in a secure place - you won't see it again!

### Step 2: Add SMTP Environment Variables to Render

1. Go to https://dashboard.render.com/
2. Click on your service: **heritage-condo-management**
3. Click **Environment** in the left sidebar
4. Click **Add Environment Variable**
5. Add each of the following variables:

   **Variable 1:**
   - Key: `SMTP_HOST`
   - Value: `smtp.gmail.com`

   **Variable 2:**
   - Key: `SMTP_PORT`
   - Value: `587`

   **Variable 3:**
   - Key: `SMTP_SECURE`
   - Value: `false`

   **Variable 4:**
   - Key: `SMTP_USER`
   - Value: `heritagecondonorthmiami@gmail.com`

   **Variable 5:**
   - Key: `SMTP_PASS`
   - Value: (paste the 16-character app password from Step 1, NO SPACES)

   **Variable 6:**
   - Key: `SMTP_FROM`
   - Value: `"Heritage Condo Board" <heritagecondonorthmiami@gmail.com>`

6. Click **Save Changes**
7. Render will automatically redeploy your service (wait 2-3 minutes)

### Step 3: Test Email Notifications

1. Have Jorge upload a test invoice
2. Check your email (Joane and Dan should receive an email)
3. Check Render logs for confirmation:
   - Go to **Logs** tab in Render dashboard
   - Look for: `📧 Email notifications sent to 2 board members`

---

## Part 2: SMS Notifications (Twilio)

### Step 1: Create Twilio Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free trial account
   - You'll get **$15 credit** for testing
   - Enough for ~500 SMS messages

3. **Verify your phone number**:
   - During signup, you'll verify your mobile number (Joane's number)
   - You'll receive a verification code via SMS
   - Enter the code to verify

4. After signup, you'll be taken to the Twilio Console

### Step 2: Get Your Twilio Credentials

1. In the Twilio Console: https://console.twilio.com/
2. You'll see your **Account SID** and **Auth Token**
   - Example:
     - Account SID: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (34 characters)
     - Auth Token: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (32 characters)
   - Click **Show** to reveal Auth Token
   - **Copy both** - you'll need them for Render

### Step 3: Get a Twilio Phone Number

1. In the Twilio Console, click **# Phone Numbers** in the left sidebar
2. Click **Buy a number** (or "Get a number" for trial accounts)
3. Select **United States** as the country
4. Check **SMS** under Capabilities
5. Optional: Enter area code `305` (Miami) or `786` (Miami)
6. Click **Search**
7. Choose a phone number from the list
8. Click **Buy** (it's free with trial credit!)
9. Your new Twilio phone number will look like: `+1XXXXXXXXXX`
10. **Copy this number** - you'll need it for Render

### Step 4: Verify Board Member Phone Numbers (Trial Account Only)

**IMPORTANT**: Twilio trial accounts can ONLY send SMS to verified phone numbers.

1. Go to **Verified Caller IDs** in the Twilio Console
2. Click **Add a new number**
3. Enter Joane's mobile number: `+1XXXXXXXXXX` (with +1 prefix)
4. Click **Call me** or **Text me** to verify
5. Enter the verification code
6. Repeat for Dan Ward's mobile number

**Note**: Once you upgrade to a paid account (~$20 deposit), you can send to ANY number without verification.

### Step 5: Add Twilio Environment Variables to Render

1. Go back to https://dashboard.render.com/
2. Click on **heritage-condo-management** service
3. Click **Environment** in the left sidebar
4. Click **Add Environment Variable**
5. Add each of the following:

   **Variable 1:**
   - Key: `TWILIO_ACCOUNT_SID`
   - Value: (paste your Account SID from Step 2)

   **Variable 2:**
   - Key: `TWILIO_AUTH_TOKEN`
   - Value: (paste your Auth Token from Step 2)

   **Variable 3:**
   - Key: `TWILIO_PHONE_NUMBER`
   - Value: (paste your Twilio phone number from Step 3, with +1)
   - Example: `+17865551234`

6. Click **Save Changes**
7. Render will automatically redeploy (wait 2-3 minutes)

---

## Part 3: Add Phone Numbers to User Accounts

### Step 1: Update Database Schema

1. Open your terminal/command prompt
2. Navigate to project directory:
   ```bash
   cd /Users/joanearistilde/Desktop/Heritage-condo-management
   ```

3. Push database changes:
   ```bash
   npm run db:push
   ```

4. If prompted about "accounts table", select **+ accounts create table** (first option)
5. Press Enter to apply changes

### Step 2: Add Phone Numbers via Database

You need to add Joane and Dan's phone numbers directly to the database:

**Option A: Using Database GUI (Neon Console)**

1. Go to https://console.neon.tech/
2. Select your project: **Heritage Condo Management**
3. Click **SQL Editor** tab
4. Run this SQL to add Joane's phone:
   ```sql
   UPDATE users
   SET phone = '+1XXXXXXXXXX', sms_notifications = true
   WHERE username = 'joane';
   ```

5. Run this SQL to add Dan's phone:
   ```sql
   UPDATE users
   SET phone = '+1XXXXXXXXXX', sms_notifications = true
   WHERE username = 'danward';
   ```

6. Verify it worked:
   ```sql
   SELECT username, email, phone, sms_notifications
   FROM users
   WHERE role IN ('board_secretary', 'board_treasurer', 'board_member');
   ```

**Option B: Using API Endpoint (Coming Soon)**

We'll add a user profile page where Joane and Dan can add their own phone numbers.

---

## Part 4: Testing the Complete System

### Test 1: Email Only (Before Twilio Setup)

1. Have Jorge upload a test invoice
2. Check email for both Joane and Dan
3. Expected result: Both receive email notification

### Test 2: Email + SMS (After Twilio Setup)

1. Have Jorge upload another test invoice
2. Check email for both Joane and Dan
3. Check SMS for both Joane and Dan
4. Expected result: Both receive email AND SMS

### Test 3: Check Render Logs

1. Go to Render Dashboard → **heritage-condo-management** → **Logs**
2. Look for these messages after invoice upload:
   ```
   📧 Email notifications sent to 2 board members
   📱 SMS notifications sent to 2 board members
   ✅ Notified 2 board members about new invoice (2 emails, 2 SMS)
   ```

---

## Troubleshooting

### Email Not Sending

**Problem**: No email received after invoice upload

**Solutions**:
1. Check SPAM/Junk folder
2. Verify SMTP environment variables in Render:
   - `SMTP_USER` = `heritagecondonorthmiami@gmail.com`
   - `SMTP_PASS` = 16-character app password (no spaces)
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`

3. Check Render logs for errors:
   - Go to Logs tab
   - Look for `❌ Failed to send invoice approval notification`
   - If you see this, check your Gmail app password

4. Verify Gmail app password is still valid:
   - Go to https://myaccount.google.com/apppasswords
   - If the app password is revoked, create a new one

### SMS Not Sending

**Problem**: No SMS received after invoice upload

**Solutions**:
1. **Trial Account Verification**:
   - Verify both Joane and Dan's phone numbers in Twilio Console
   - Go to **Verified Caller IDs** → Add both numbers

2. **Check Twilio Balance**:
   - Go to Twilio Console dashboard
   - Check if you have trial credit remaining
   - Each SMS costs ~$0.0075

3. **Check Phone Number Format**:
   - Must be E.164 format: `+1XXXXXXXXXX` (with +1)
   - Example: `+17865551234`

4. **Check Render Logs**:
   - Look for: `📱 SMS notifications sent to 2 board members`
   - If you see errors, check Twilio credentials in Render

5. **Verify `sms_notifications` is enabled**:
   - Run this SQL in Neon:
   ```sql
   SELECT username, phone, sms_notifications FROM users WHERE username IN ('joane', 'danward');
   ```
   - Both should have `sms_notifications = true`

### Both Email and SMS Not Working

**Problem**: No notifications at all

**Solutions**:
1. Check if invoice was created successfully:
   - Go to Invoices page in the app
   - Verify the invoice appears in the list

2. Check if notification code is running:
   - In Render logs, look for:
     `✅ Notified X board members about new invoice`
   - If you don't see this, the notification code may not be running

3. Verify Render has latest code:
   - Go to GitHub repository
   - Check latest commit includes notification code
   - Go to Render → **Manual Deploy** → **Deploy latest commit**

---

## Cost Breakdown

### Email (Gmail)
- **Cost**: FREE
- **Limit**: 500 emails per day with Gmail app password
- **Recommendation**: More than enough for Heritage Condo

### SMS (Twilio)
- **Trial**: $15 credit (~500 SMS)
- **Production**: $20 minimum deposit
  - $0.0075 per SMS sent in the US
  - $0.0075 per SMS received (for 2-way messaging)
  - $1.15/month per phone number

**Estimated Monthly Cost for Heritage Condo**:
- Phone number: $1.15/month
- Estimated SMS usage:
  - 10 invoices/month × 2 board members = 20 SMS = $0.15
  - 5 delinquency notices/month × 1 owner = 5 SMS = $0.04
  - Total SMS: ~$0.20/month
- **Total**: ~$1.35/month ($16.20/year)

**Cost-Effective Alternative**: Skip SMS for now and use email only (FREE).

---

## Next Steps

1. ✅ Set up Gmail app password
2. ✅ Add SMTP variables to Render
3. ✅ Test email notifications
4. ⏸️ Optional: Set up Twilio for SMS
5. ⏸️ Optional: Add phone numbers to database
6. ⏸️ Optional: Test SMS notifications

**Recommendation**: Start with email only (Steps 1-3). Add SMS later if needed.

---

## Support

If you encounter any issues:
1. Check Render logs for error messages
2. Verify environment variables are set correctly
3. Test with a single recipient first
4. Contact support:
   - Gmail: https://support.google.com/mail/
   - Twilio: https://support.twilio.com/

**Email works perfectly for invoice approvals. SMS is a nice-to-have but not required!**
