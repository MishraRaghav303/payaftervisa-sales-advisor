// USD per 1M tokens. Update if Anthropic pricing changes.
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-sonnet-5": { input: 2.0, output: 10.0 },
  "claude-haiku-4-5": { input: 1.0, output: 5.0 },
};

export function estimateCostUsd(
  model: string,
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens?: number;
    cacheReadTokens?: number;
  },
): number {
  const rates = PRICING[model];
  if (!rates) return 0;
  const cacheCreationTokens = usage.cacheCreationTokens ?? 0;
  const cacheReadTokens = usage.cacheReadTokens ?? 0;
  return (
    (usage.inputTokens / 1_000_000) * rates.input +
    // Cache writes cost 1.25x normal input price; cache reads cost ~0.1x.
    (cacheCreationTokens / 1_000_000) * rates.input * 1.25 +
    (cacheReadTokens / 1_000_000) * rates.input * 0.1 +
    (usage.outputTokens / 1_000_000) * rates.output
  );
}
