import { db } from "@/lib/db/client";
import { usageLogs } from "@/lib/db/schema";
import { estimateCostUsd } from "./pricing";

export async function logUsage(params: {
  customerId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  purpose: "conversation" | "extraction";
}) {
  const cost = estimateCostUsd(
    params.model,
    params.inputTokens,
    params.outputTokens,
  );

  await db.insert(usageLogs).values({
    customerId: params.customerId,
    model: params.model,
    inputTokens: params.inputTokens,
    outputTokens: params.outputTokens,
    estimatedCostUsd: cost.toFixed(6),
    purpose: params.purpose,
  });

  return cost;
}
