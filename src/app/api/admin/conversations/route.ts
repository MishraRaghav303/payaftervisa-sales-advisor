import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { customers, profiles, leads, usageLogs } from "@/lib/db/schema";

export async function GET() {
  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      phone: customers.phone,
      createdAt: customers.createdAt,
      destinationCountry: profiles.destinationCountry,
      leadStatus: sql<string | null>`(
        select ${leads.status} from ${leads}
        where ${leads.customerId} = ${customers.id}
        order by ${leads.createdAt} desc limit 1
      )`,
      totalCostUsd: sql<string>`coalesce((
        select sum(${usageLogs.estimatedCostUsd}) from ${usageLogs}
        where ${usageLogs.customerId} = ${customers.id}
      ), 0)`,
    })
    .from(customers)
    .leftJoin(profiles, eq(profiles.customerId, customers.id))
    .orderBy(desc(customers.updatedAt));

  return NextResponse.json({ customers: rows });
}
