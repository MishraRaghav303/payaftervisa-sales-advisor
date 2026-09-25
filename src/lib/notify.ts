import { Resend } from "resend";
import { db } from "@/lib/db/client";
import { errorLogs } from "@/lib/db/schema";

const ALERT_EMAIL = process.env.ALERT_EMAIL_TO;
// Resend's shared sandbox sender - works without verifying a domain, but
// has a real risk of landing in spam since it's shared across many
// developers. Verify a real domain in Resend before relying on this in
// production.
const FROM = "PayAfterVisa Advisor <onboarding@resend.dev>";

function getClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

// Writes directly to the table rather than going through logError(), which
// itself calls alertError() - reusing it here would let a persistent
// Resend failure call itself indefinitely.
async function recordSendFailure(source: string, detail: string) {
  try {
    await db.insert(errorLogs).values({ source, message: detail });
  } catch {
    // If we can't even log it, there's nothing more to do.
  }
}

export async function alertError(params: {
  source: string;
  message: string;
}) {
  const resend = getClient();
  if (!resend || !ALERT_EMAIL) return;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: ALERT_EMAIL,
      subject: `⚠️ Advisor error: ${params.source}`,
      text: `An error occurred in the PayAfterVisa advisor.\n\nSource: ${params.source}\nMessage: ${params.message}\n\nCheck /admin for details.`,
    });
    if (error) await recordSendFailure("notify.alertError", JSON.stringify(error));
  } catch (err) {
    await recordSendFailure("notify.alertError", String(err));
  }
}

export async function alertHotLead(params: {
  customerName: string | null;
  serviceType: string;
  summary: string;
}) {
  const resend = getClient();
  if (!resend || !ALERT_EMAIL) return;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: ALERT_EMAIL,
      subject: `🔥 Hot lead: ${params.customerName ?? "New customer"} — ${params.serviceType}`,
      text: `A hot lead just came in.\n\nCustomer: ${params.customerName ?? "(name not yet given)"}\nService: ${params.serviceType}\n\nSummary: ${params.summary}\n\nView full details in /admin.`,
    });
    if (error) await recordSendFailure("notify.alertHotLead", JSON.stringify(error));
  } catch (err) {
    await recordSendFailure("notify.alertHotLead", String(err));
  }
}
