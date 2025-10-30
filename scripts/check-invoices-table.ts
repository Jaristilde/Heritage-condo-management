import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function checkInvoicesTable() {
  try {
    console.log("🔍 Checking if invoices table exists...");

    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'invoices'
      );
    `);

    console.log("Result:", result);

    if (result.rows[0].exists) {
      console.log("✅ Invoices table EXISTS");

      // Count rows
      const count = await db.execute(sql`SELECT COUNT(*) FROM invoices;`);
      console.log(`   Found ${count.rows[0].count} invoices in the table`);
    } else {
      console.log("❌ Invoices table DOES NOT EXIST");
      console.log("\n👉 You need to create the table by running:");
      console.log("   npm run db:push");
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);

    if (error.message.includes('does not exist')) {
      console.log("\n❌ CONFIRMED: Invoices table does not exist!");
      console.log("\n📋 SOLUTION:");
      console.log("1. Run: npm run db:push");
      console.log("2. When prompted, select: '+ invoices create table'");
      console.log("3. Refresh your browser with Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)");
    }
  }

  process.exit(0);
}

checkInvoicesTable();
