import "dotenv/config";
import { db } from "../server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function checkUser() {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, "owner202"))
    .limit(1);

  console.log("User found:", user.length > 0);

  if (user.length > 0) {
    console.log("\nUser Details:");
    console.log("  Username:", user[0].username);
    console.log("  Email:", user[0].email);
    console.log("  Role:", user[0].role);
    console.log("  Must Change Password:", user[0].mustChangePassword);
    console.log("  Unit ID:", user[0].unitId);

    // Test the password
    const testPassword = "$Q6xA#rrVA2G";
    const isValid = await bcrypt.compare(testPassword, user[0].password);
    console.log("\nPassword Test:");
    console.log("  Testing password: $Q6xA#rrVA2G");
    console.log("  Password valid:", isValid);
  } else {
    console.log("❌ User owner202 not found!");
  }
}

checkUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
