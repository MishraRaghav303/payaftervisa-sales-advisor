import { db } from "@/lib/db/client";
import { usageLogs } from "@/lib/db/schema";
import { estimateCostUsd } from "./pricing";

export async function logUsage(params: {
  customerId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
  purpose: "conversation" | "extraction";
}) {
  const cost = estimateCostUsd(params.model, params);

  await db.insert(usageLogs).values({
    customerId: params.customerId,
    model: params.model,
    // Total tokens the call actually processed, cache or not, for an
    // honest record of volume - estimatedCostUsd is what accounts for
    // the different cache read/write/miss pricing.
    inputTokens:
      params.inputTokens +
      (params.cacheCreationTokens ?? 0) +
      (params.cacheReadTokens ?? 0),
    outputTokens: params.outputTokens,
    estimatedCostUsd: cost.toFixed(6),
    purpose: params.purpose,
  });

  return cost;
}
