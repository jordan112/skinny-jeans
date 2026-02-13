import { countTokens } from "./token-count.js";

export interface TruncationResult {
  content: string;
  truncated: boolean;
  originalTokens: number;
  finalTokens: number;
}

export function truncateToTokenLimit(
  text: string,
  maxTokens?: number,
): TruncationResult {
  const originalTokens = countTokens(text);

  if (!maxTokens || originalTokens <= maxTokens) {
    return { content: text, truncated: false, originalTokens, finalTokens: originalTokens };
  }

  // Estimate character count for target tokens (rough: ~4 chars/token)
  const ratio = maxTokens / originalTokens;
  let cutPoint = Math.floor(text.length * ratio);

  // Try to cut at a line boundary
  const newline = text.lastIndexOf("\n", cutPoint);
  if (newline > cutPoint * 0.8) {
    cutPoint = newline;
  }

  const truncated = text.slice(0, cutPoint);
  const suffix = `\n\n[skinny-jeans: truncated at ~${maxTokens} tokens (original: ~${originalTokens} tokens)]`;
  const content = truncated + suffix;

  return {
    content,
    truncated: true,
    originalTokens,
    finalTokens: countTokens(content),
  };
}
