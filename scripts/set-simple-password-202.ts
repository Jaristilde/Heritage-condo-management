import "dotenv/config";
import { db } from "../server/db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function setSimplePassword() {
  console.log("Setting simple temporary password for owner202...");

  const simplePassword = "Temp1234!";
  const hashedPassword = await bcrypt.hash(simplePassword, 10);

  await db
    .update(users)
    .set({
      password: hashedPassword,
      mustChangePassword: true,
    })
    .where(eq(users.username, "owner202"));

  console.log("✅ Password updated successfully!");
  console.log("");
  console.log("NEW LOGIN CREDENTIALS FOR UNIT 202:");
  console.log("  Username: owner202");
  console.log("  Temporary Password: Temp1234!");
  console.log("");
  console.log("⚠️  User will be forced to change password on first login");
}

setSimplePassword()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
