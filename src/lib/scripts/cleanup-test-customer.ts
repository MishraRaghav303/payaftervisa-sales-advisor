import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { customers, messages, profiles, usageLogs } from "@/lib/db/schema";

async function main() {
  const token = process.argv[2];
  if (!token) throw new Error("usage: cleanup-test-customer.ts <sessionToken>");

  const rows = await db.select().from(customers).where(eq(customers.sessionToken, token));
  if (rows.length === 0) {
    console.log("no customer found for that session token");
    return;
  }
  const id = rows[0].id;
  await db.delete(usageLogs).where(eq(usageLogs.customerId, id));
  await db.delete(messages).where(eq(messages.customerId, id));
  await db.delete(profiles).where(eq(profiles.customerId, id));
  await db.delete(customers).where(eq(customers.id, id));
  console.log("cleaned up customer", id);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
