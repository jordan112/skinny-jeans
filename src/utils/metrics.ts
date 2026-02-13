import { countTokens } from "./token-count.js";

export interface TransformMetrics {
  originalTokens: number;
  optimizedTokens: number;
  savingsPercent: number;
  header: string;
}

export function calculateMetrics(original: string, optimized: string): TransformMetrics {
  const originalTokens = countTokens(original);
  const optimizedTokens = countTokens(optimized);
  const savingsPercent =
    originalTokens > 0
      ? Math.round(((originalTokens - optimizedTokens) / originalTokens) * 100)
      : 0;

  const header = `[skinny-jeans: ${savingsPercent}% smaller, ~${optimizedTokens} tokens (was ~${originalTokens})]`;

  return { originalTokens, optimizedTokens, savingsPercent, header };
}

export function formatHeader(metrics: TransformMetrics): string {
  return metrics.header;
}
