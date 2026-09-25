import { NextRequest, NextResponse, after } from "next/server";
import { eq, asc } from "drizzle-orm";
import type Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db/client";
import { customers, messages, profiles, leads } from "@/lib/db/schema";
import { runConversationTurn } from "@/lib/ai/chat";
import { extractProfile } from "@/lib/ai/extract";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";
import { logError } from "@/lib/logError";
import { alertHotLead } from "@/lib/notify";

async function getOrCreateCustomer(sessionToken: string) {
  const existing = await db
    .select()
    .from(customers)
    .where(eq(customers.sessionToken, sessionToken))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const [created] = await db
    .insert(customers)
    .values({ sessionToken })
    .returning();
  return created;
}

export async function GET(req: NextRequest) {
  const sessionToken = req.nextUrl.searchParams.get("sessionToken");
  if (!sessionToken) {
    return NextResponse.json({ error: "sessionToken is required" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(customers)
    .where(eq(customers.sessionToken, sessionToken))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ messages: [], profile: null, lead: null });
  }

  const customer = existing[0];

  const [history, profileRows, leadRows] = await Promise.all([
    db
      .select()
      .from(messages)
      .where(eq(messages.customerId, customer.id))
      .orderBy(asc(messages.createdAt)),
    db.select().from(profiles).where(eq(profiles.customerId, customer.id)).limit(1),
    db
      .select()
      .from(leads)
      .where(eq(leads.customerId, customer.id))
      .orderBy(asc(leads.createdAt)),
  ]);

  return NextResponse.json({
    messages: history,
    profile: profileRows[0] ?? null,
    leads: leadRows,
  });
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      { error: "Too many messages, please slow down and try again in a minute." },
      { status: 429 },
    );
  }

  const body = await req.json();
  const { sessionToken, message } = body as { sessionToken?: string; message?: string };

  if (!sessionToken || !message) {
    return NextResponse.json(
      { error: "sessionToken and message are required" },
      { status: 400 },
    );
  }

  let customerForErrorLogging: string | undefined;
  try {
    const customer = await getOrCreateCustomer(sessionToken);
    customerForErrorLogging = customer.id;

    const priorMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.customerId, customer.id))
      .orderBy(asc(messages.createdAt));

    const history: Anthropic.MessageParam[] = priorMessages
      .filter((m) => m.role === "customer" || m.role === "advisor")
      .map((m) => ({
        role: m.role === "customer" ? "user" : "assistant",
        content: m.content,
      }));

    const { replyText, leadCreated, lead } = await runConversationTurn(
      customer.id,
      history,
      message,
    );

    await db.insert(messages).values([
      { customerId: customer.id, role: "customer", content: message },
      { customerId: customer.id, role: "advisor", content: replyText },
    ]);

    // Structured extraction and the hot-lead email are not needed for the
    // customer-facing reply - both run after the response is sent so they
    // don't add to perceived latency, and `after()` is the safe place for
    // this kind of work on serverless (a plain un-awaited promise isn't
    // guaranteed to finish once the response has gone out).
    after(async () => {
      if (lead?.status === "hot") {
        await alertHotLead({
          customerName: customer.name,
          serviceType: lead.serviceType ?? "Unknown service",
          summary: lead.summary ?? "",
        });
      }

      const fullTranscript = [
        ...priorMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: "customer", content: message },
        { role: "advisor", content: replyText },
      ];

      const extraction = await extractProfile(customer.id, fullTranscript);

      await db
        .insert(profiles)
        .values({
          customerId: customer.id,
          nationality: extraction.nationality,
          residenceCountry: extraction.residenceCountry,
          destinationCountry: extraction.destinationCountry,
          purpose: extraction.purpose,
          age: extraction.age,
          travelHistory: extraction.travelHistory,
          educationWorkProfile: extraction.educationWorkProfile,
          approxBudget: extraction.approxBudget,
          travelTimeline: extraction.travelTimeline,
          raw: extraction,
        })
        .onConflictDoUpdate({
          target: profiles.customerId,
          set: {
            nationality: extraction.nationality,
            residenceCountry: extraction.residenceCountry,
            destinationCountry: extraction.destinationCountry,
            purpose: extraction.purpose,
            age: extraction.age,
            travelHistory: extraction.travelHistory,
            educationWorkProfile: extraction.educationWorkProfile,
            approxBudget: extraction.approxBudget,
            travelTimeline: extraction.travelTimeline,
            raw: extraction,
            updatedAt: new Date(),
          },
        });

      if (extraction.name || extraction.email || extraction.phone) {
        await db
          .update(customers)
          .set({
            name: extraction.name ?? customer.name,
            email: extraction.email ?? customer.email,
            phone: extraction.phone ?? customer.phone,
            updatedAt: new Date(),
          })
          .where(eq(customers.id, customer.id));
      }
    });

    return NextResponse.json({
      reply: replyText,
      leadCreated,
      sessionToken,
    });
  } catch (error) {
    await logError({
      source: "conversation_api",
      error,
      customerId: customerForErrorLogging,
    });
    return NextResponse.json(
      { error: "Something went wrong on our end. Please try again in a moment." },
      { status: 500 },
    );
  }
}
