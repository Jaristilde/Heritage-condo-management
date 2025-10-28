import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateBankFundType() {
  console.log("🔄 Adding fund_type column to bank_accounts...");

  try {
    const migrationPath = path.join(__dirname, "../migrations/add_bank_fund_type.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    await db.execute(sql.raw(migrationSQL));

    console.log("✅ Migration completed successfully!");
    console.log("   Added fund_type column to bank_accounts table");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

migrateBankFundType()
  .then(() => {
    console.log("\n🎉 Bank fund_type migration complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration error:", error);
    process.exit(1);
  });
