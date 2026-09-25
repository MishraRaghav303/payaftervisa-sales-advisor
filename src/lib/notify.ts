import { Resend } from "resend";

const ALERT_EMAIL = process.env.ALERT_EMAIL_TO;
// Resend's shared sandbox sender - works without verifying a domain.
const FROM = "PayAfterVisa Advisor <onboarding@resend.dev>";

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
    await resend.emails.send({
      from: FROM,
      to: ALERT_EMAIL,
      subject: `⚠️ Advisor error: ${params.source}`,
      text: `An error occurred in the PayAfterVisa advisor.\n\nSource: ${params.source}\nMessage: ${params.message}\n\nCheck /admin for details.`,
    });
  } catch {
    // Don't let a failed notification break the request it's reporting on.
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
    await resend.emails.send({
      from: FROM,
      to: ALERT_EMAIL,
      subject: `🔥 Hot lead: ${params.customerName ?? "New customer"} — ${params.serviceType}`,
      text: `A hot lead just came in.\n\nCustomer: ${params.customerName ?? "(name not yet given)"}\nService: ${params.serviceType}\n\nSummary: ${params.summary}\n\nView full details in /admin.`,
    });
  } catch {
    // Same - never let a notification failure break the main flow.
  }
}
