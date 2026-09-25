import { Resend } from "resend";
import { db } from "@/lib/db/client";
import { errorLogs } from "@/lib/db/schema";

const ALERT_EMAIL = process.env.ALERT_EMAIL_TO;
// Resend's shared sandbox sender - works without verifying a domain.
const FROM = "PayAfterVisa Advisor <onboarding@resend.dev>";

// Temporary: records what actually happened on each send attempt into the
// database, since serverless log streaming has been unreliable while
// debugging why alerts weren't arriving. Safe to remove once confirmed
// working - this is diagnostics, not a permanent feature.
async function debugTrace(note: string) {
  try {
    await db.insert(errorLogs).values({ source: "notify_debug", message: note });
  } catch {
    // best-effort only
  }
}

function getClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
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
    if (error) await debugTrace(`alertError send failed: ${JSON.stringify(error)}`);
  } catch (err) {
    await debugTrace(`alertError threw: ${String(err)}`);
  }
}

export async function alertHotLead(params: {
  customerName: string | null;
  serviceType: string;
  summary: string;
}) {
  await debugTrace(
    `alertHotLead called. hasApiKey=${Boolean(process.env.RESEND_API_KEY)} hasAlertEmail=${Boolean(ALERT_EMAIL)}`,
  );

  const resend = getClient();
  if (!resend || !ALERT_EMAIL) return;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: ALERT_EMAIL,
      subject: `🔥 Hot lead: ${params.customerName ?? "New customer"} — ${params.serviceType}`,
      text: `A hot lead just came in.\n\nCustomer: ${params.customerName ?? "(name not yet given)"}\nService: ${params.serviceType}\n\nSummary: ${params.summary}\n\nView full details in /admin.`,
    });
    if (error) {
      await debugTrace(`alertHotLead send failed: ${JSON.stringify(error)}`);
    } else {
      await debugTrace(`alertHotLead sent OK, id=${data?.id}`);
    }
  } catch (err) {
    await debugTrace(`alertHotLead threw: ${String(err)}`);
  }
}
