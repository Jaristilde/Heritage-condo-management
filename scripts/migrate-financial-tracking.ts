import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function migrateFinancialTracking() {
  console.log('🔧 Starting financial tracking schema migration...\n');

  try {
    // Add SA#1 (Popular Loan) tracking columns
    console.log('Adding SA#1 (Popular Loan) columns...');
    await db.execute(sql`
      ALTER TABLE units
      ADD COLUMN IF NOT EXISTS sa1_original_balance DECIMAL(10,2) DEFAULT 17500.00,
      ADD COLUMN IF NOT EXISTS sa1_monthly_charge DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS sa1_paid_july BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS sa1_status VARCHAR(50) DEFAULT 'Paid Off'
    `);

    // Add SA#2 (2024 Assessment) tracking columns
    console.log('Adding SA#2 (2024 Assessment) columns...');
    await db.execute(sql`
      ALTER TABLE units
      ADD COLUMN IF NOT EXISTS sa2_original_balance DECIMAL(10,2) DEFAULT 11920.92,
      ADD COLUMN IF NOT EXISTS sa2_remaining_balance DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS sa2_status VARCHAR(50) DEFAULT 'Paid Off',
      ADD COLUMN IF NOT EXISTS sa2_on_payment_plan BOOLEAN DEFAULT false
    `);

    // Add monthly charges breakdown
    console.log('Adding monthly charges breakdown columns...');
    await db.execute(sql`
      ALTER TABLE units
      ADD COLUMN IF NOT EXISTS total_monthly_due DECIMAL(10,2)
    `);

    // Add status flags
    console.log('Adding status flag columns...');
    await db.execute(sql`
      ALTER TABLE units
      ADD COLUMN IF NOT EXISTS red_flag BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS delinquent BOOLEAN DEFAULT false
    `);

    // Note: 'notes' column likely already exists, but let's add if not
    await db.execute(sql`
      ALTER TABLE units
      ADD COLUMN IF NOT EXISTS notes TEXT
    `);

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNew columns added:');
    console.log('  - SA#1 tracking: sa1_original_balance, sa1_monthly_charge, sa1_paid_july, sa1_status');
    console.log('  - SA#2 tracking: sa2_original_balance, sa2_remaining_balance, sa2_status, sa2_on_payment_plan');
    console.log('  - Charges: total_monthly_due');
    console.log('  - Flags: red_flag, delinquent, notes');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateFinancialTracking();
