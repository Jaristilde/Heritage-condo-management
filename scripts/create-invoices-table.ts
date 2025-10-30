import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createInvoicesTable() {
  console.log("📋 Creating invoices table...");

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        vendor_id VARCHAR NOT NULL,
        invoice_number TEXT NOT NULL,
        invoice_date TIMESTAMP NOT NULL,
        due_date TIMESTAMP NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        gl_code TEXT,
        description TEXT,
        file_url TEXT,
        file_name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        payment_date TIMESTAMP,
        payment_method TEXT,
        check_number TEXT,
        uploaded_by VARCHAR NOT NULL,
        approved_by VARCHAR,
        approved_at TIMESTAMP,
        rejected_by VARCHAR,
        rejected_at TIMESTAMP,
        rejection_reason TEXT,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log("✅ Invoices table created successfully!");

    // Verify it exists
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'invoices'
      );
    `);

    if (result.rows[0].exists) {
      console.log("✅ CONFIRMED: Invoices table now exists in the database");
    }
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log("✅ Invoices table already exists");
    } else {
      console.error("❌ Error creating table:", error.message);
    }
  }

  process.exit(0);
}

createInvoicesTable();
