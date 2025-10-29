import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function checkBankSchema() {
  console.log("🔍 Checking bank_accounts table schema...\n");

  try {
    const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'bank_accounts'
      ORDER BY ordinal_position
    `);

    console.log("Current columns in bank_accounts table:");
    console.log("━".repeat(80));

    result.rows.forEach((row: any) => {
      console.log(`${row.column_name.padEnd(25)} ${row.data_type.padEnd(20)} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log("━".repeat(80));

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

checkBankSchema()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed:", error);
    process.exit(1);
  });
