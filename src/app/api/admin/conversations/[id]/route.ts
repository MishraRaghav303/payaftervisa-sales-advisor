import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { customers, messages, profiles, leads, usageLogs } from "@/lib/db/schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [customerRows, messageRows, profileRows, leadRows, usageRows] =
    await Promise.all([
      db.select().from(customers).where(eq(customers.id, id)).limit(1),
      db
        .select()
        .from(messages)
        .where(eq(messages.customerId, id))
        .orderBy(asc(messages.createdAt)),
      db.select().from(profiles).where(eq(profiles.customerId, id)).limit(1),
      db
        .select()
        .from(leads)
        .where(eq(leads.customerId, id))
        .orderBy(asc(leads.createdAt)),
      db
        .select()
        .from(usageLogs)
        .where(eq(usageLogs.customerId, id))
        .orderBy(asc(usageLogs.createdAt)),
    ]);

  if (customerRows.length === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const totalCostUsd = usageRows.reduce(
    (sum, u) => sum + Number(u.estimatedCostUsd),
    0,
  );

  return NextResponse.json({
    customer: customerRows[0],
    messages: messageRows,
    profile: profileRows[0] ?? null,
    leads: leadRows,
    usage: usageRows,
    totalCostUsd,
  });
}
