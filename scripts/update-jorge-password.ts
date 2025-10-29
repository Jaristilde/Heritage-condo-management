import "dotenv/config";
import { db } from "../server/db";
import { users } from "@shared/schema";
import * as bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function updateJorgePassword() {
  console.log("🔐 Updating Jorge's password to management123...");

  try {
    const hashedPassword = await bcrypt.hash("management123", 12);

    await db.update(users)
      .set({ password: hashedPassword, mustChangePassword: false })
      .where(eq(users.username, "jorge"));

    console.log("✅ Jorge's password updated successfully!");
    console.log("\n📋 Jorge's Login Credentials:");
    console.log("   Username: jorge");
    console.log("   Password: management123");
    console.log("   Role: Management");
    console.log("\n");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

updateJorgePassword()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Failed:", error);
    process.exit(1);
  });
