import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { errorLogs } from "@/lib/db/schema";

export async function GET() {
  const rows = await db
    .select()
    .from(errorLogs)
    .orderBy(desc(errorLogs.createdAt))
    .limit(50);

  return NextResponse.json({ errors: rows });
}
