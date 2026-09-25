import { db } from "@/lib/db/client";
import { errorLogs } from "@/lib/db/schema";
import { alertError } from "@/lib/notify";

export async function logError(params: {
  source: string;
  error: unknown;
  customerId?: string;
}) {
  const message = params.error instanceof Error ? params.error.message : String(params.error);
  const stack = params.error instanceof Error ? params.error.stack : undefined;

  try {
    await db.insert(errorLogs).values({
      source: params.source,
      message,
      stack,
      customerId: params.customerId,
    });
  } catch {
    // If we can't even write the error log, there's nothing more to do here.
  }

  await alertError({ source: params.source, message });
}
