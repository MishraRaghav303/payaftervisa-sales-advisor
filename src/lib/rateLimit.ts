// Simple in-memory sliding-window rate limit, per IP. Resets on cold
// start, so it's a best-effort backstop rather than a hard guarantee -
// but it directly protects against the realistic risk here: one actor
// hammering the chat endpoint and running up API cost in a short burst.
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;

const requestLog = new Map<string, number[]>();

export function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(identifier) ?? []).filter(
    (t) => now - t < WINDOW_MS,
  );

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(identifier, timestamps);
    return true;
  }

  timestamps.push(now);
  requestLog.set(identifier, timestamps);

  // Prevent unbounded growth across many distinct IPs on a long-lived
  // warm instance.
  if (requestLog.size > 5000) {
    const cutoff = now - WINDOW_MS;
    for (const [key, times] of requestLog) {
      if (times.every((t) => t < cutoff)) requestLog.delete(key);
    }
  }

  return false;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
