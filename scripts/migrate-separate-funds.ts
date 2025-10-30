import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function migrateSeparateFunds() {
  console.log('🚨 EMERGENCY: Fixing fund co-mingling issue...\n');

  try {
    // MAINTENANCE FUND TRACKING
    console.log('Adding Maintenance fund tracking columns...');
    await db.execute(sql`
      ALTER TABLE units
      ADD COLUMN IF NOT EXISTS maintenance_prior_balance DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS maintenance_payment_july DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS maintenance_balance DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS maintenance_paid BOOLEAN DEFAULT false
    `);

    // SA#1 FUND TRACKING
    console.log('Adding SA#1 Popular Loan fund tracking columns...');
    await db.execute(sql`
      ALTER TABLE units
      ADD COLUMN IF NOT EXISTS has_popular_loan BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS sa1_prior_balance DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS sa1_payment_july DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS sa1_balance DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS sa1_paid BOOLEAN DEFAULT false
    `);

    // SA#2 FUND TRACKING
    console.log('Adding SA#2 (2024 Assessment) fund tracking columns...');
    await db.execute(sql`
      ALTER TABLE units
      ADD COLUMN IF NOT EXISTS sa2_payment_july DECIMAL(10,2) DEFAULT 0
    `);

    console.log('\n✅ Fund separation columns added successfully!');
    console.log('\n📊 New tracking structure:');
    console.log('   💳 Maintenance Fund: prior_balance, payment_july, balance, paid');
    console.log('   💳 SA#1 Fund: prior_balance, payment_july, balance, paid');
    console.log('   💳 SA#2 Fund: balance (existing), payment_july, on_payment_plan');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateSeparateFunds();
