import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { detectFileCategory } from "../utils/file-detect.js";
import { calculateMetrics } from "../utils/metrics.js";
import { truncateToTokenLimit } from "../utils/size-guard.js";
import { jsonToToon, jsonlToToon } from "../transforms/json-to-toon.js";
import { minifyMarkdown } from "../transforms/markdown-minify.js";
import { stripComments } from "../transforms/code-strip.js";
import { genericCompress } from "../transforms/generic-compress.js";

export interface ReadFileArgs {
  path: string;
  maxTokens?: number;
  raw?: boolean;
}

export async function readFileTool(args: ReadFileArgs): Promise<string> {
  const filePath = resolve(args.path);
  const original = await readFile(filePath, "utf-8");

  if (args.raw) {
    const truncated = truncateToTokenLimit(original, args.maxTokens);
    return truncated.content;
  }

  const category = detectFileCategory(filePath);
  let optimized: string;

  try {
    switch (category) {
      case "json":
        optimized = jsonToToon(original);
        break;
      case "jsonl":
        optimized = jsonlToToon(original);
        break;
      case "markdown":
        optimized = minifyMarkdown(original);
        break;
      case "code":
        optimized = stripComments(original, filePath);
        break;
      default:
        optimized = genericCompress(original);
    }
  } catch {
    // If transform fails, fall back to original
    optimized = original;
  }

  const metrics = calculateMetrics(original, optimized);
  const truncated = truncateToTokenLimit(optimized, args.maxTokens);
  const header = metrics.header;

  return `${header}\n\n${truncated.content}`;
}
