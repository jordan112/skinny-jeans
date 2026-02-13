import { estimateTokenCount } from "tokenx";

const cache = new Map<string, number>();
const MAX_CACHE = 500;

export function countTokens(text: string): number {
  if (text.length < 200) {
    return estimateTokenCount(text);
  }

  const key = text.length + ":" + text.slice(0, 100) + text.slice(-100);
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const count = estimateTokenCount(text);

  if (cache.size >= MAX_CACHE) {
    const first = cache.keys().next().value!;
    cache.delete(first);
  }
  cache.set(key, count);
  return count;
}
