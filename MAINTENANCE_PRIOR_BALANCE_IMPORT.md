# 📊 Maintenance Prior Balance Import Guide

## 🎯 Purpose
Import the **maintenance prior balances** (June 2025 ending balance) for each unit so they display correctly on the Units page.

---

## 📋 Step-by-Step Instructions

### Step 1: Edit the CSV Template

Open this file in Excel or any text editor:
```
public/templates/maintenance-prior-balance-template.csv
```

### Step 2: Fill in the Prior Balances

**Important:** The "Prior Balance" is what each unit owed for **Monthly Maintenance** at the end of **June 2025** (BEFORE July 2025 charges).

**Example:**
```csv
Unit,Owner,Prior Balance (June 2025)
201,Jose Peirats,1234.56
202,Joane Aristilde,578.45
203,Gabrielle Fabre,0.00
204,Lorraine Epelbaum,2500.00
```

**Guidelines:**
- Use **positive numbers** for amounts OWED by the unit
- Use **negative numbers** for CREDIT balances (e.g., `-505.27` if they overpaid)
- Use `0.00` if they had zero balance at end of June

### Step 3: Save the CSV

Save the file (keep the same name and location).

### Step 4: Run the Import Script

In your terminal:
```bash
npm run import:prior-balances
```

You'll see output like:
```
📊 Importing Maintenance Prior Balances from CSV...

📋 Found 24 units in CSV

✅ Unit 201: Set prior balance to $1234.56
✅ Unit 202: Set prior balance to $578.45
✅ Unit 203: Set prior balance to $0.00
...

============================================================
📊 Import Summary:
============================================================
✅ Updated: 24 units
⚠️ Skipped: 0 units
============================================================

🎉 Import complete!

💡 Next step: Refresh the Units page to see the prior balances!
```

### Step 5: Verify on Units Page

1. Go to http://localhost:5001
2. Login as board member
3. Click **Units & Ledgers**
4. Check the **Monthly Maintenance** section for each unit
5. You should now see the correct **Prior Balance** displayed!

---

## 💡 How Prior Balance is Used

The Units page shows a monthly breakdown:

```
Prior Balance:        $1,234.56   (what they owed end of June)
July 2025 Charge:   +   $578.45   (monthly maintenance fee)
July 2025 Payment:  -   $578.45   (what they paid)
─────────────────────────────────
New Balance:          $1,234.56   (what they owe now)
```

This gives a clear picture of:
- Where they started (Prior Balance)
- What was charged (July Charge)
- What they paid (July Payment)
- Where they are now (New Balance)

---

## 🔍 Finding Prior Balances from Juda & Eskew

If you're getting this data from your Juda & Eskew report:

1. **Look for "Maintenance Balance" column** for June 2025
2. **Or calculate it:**
   ```
   Prior Balance = Total Owed - SA#1 Balance - SA#2 Balance - July Maintenance
   ```

**Example for Unit 202:**
- Total Owed: $6,856.07 (from CSV)
- SA#1 Balance: $208.00
- SA#2 Balance: $6,856.07
- July Maintenance: $578.45

**Maintenance Prior Balance = ?** (You'll need to extract this from your detailed report)

---

## ⚠️ Important Notes

1. **This only updates Maintenance fund** - SA#1 and SA#2 prior balances are separate
2. **Safe to run multiple times** - Each import overwrites previous values
3. **Only updates units that exist** - Skips any unit numbers not in database
4. **Validates numbers** - Skips any row with invalid balance format

---

## 🆘 Troubleshooting

### "CSV file not found"
- Make sure the file is at: `public/templates/maintenance-prior-balance-template.csv`
- Check that you're running the command from the project root directory

### "Unit XXX not found in database"
- That unit number doesn't exist in your database
- Double-check the unit number matches exactly (e.g., "201" not "Unit 201")

### "Invalid prior balance"
- Make sure the number is in format: `1234.56` (no $ signs, no commas)
- Use `.` for decimal point, not `,`
- For negative (credit), use: `-1234.56`

---

## 🎉 Next Steps

Once prior balances are imported correctly:
1. ✅ Units page will show accurate monthly maintenance tracking
2. ✅ Board can see historical balances
3. ✅ Owner statements will be accurate
4. ✅ Reports will include correct starting balances

**This is a one-time import - future months will calculate automatically!**
