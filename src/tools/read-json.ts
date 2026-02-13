import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { detectFileCategory } from "../utils/file-detect.js";
import { calculateMetrics } from "../utils/metrics.js";
import { truncateToTokenLimit } from "../utils/size-guard.js";
import { jsonToToon, jsonlToToon, type JsonToToonOptions } from "../transforms/json-to-toon.js";

export interface ReadJsonArgs {
  path: string;
  delimiter?: "comma" | "tab" | "pipe";
  keyFolding?: "off" | "safe";
  maxTokens?: number;
}

export async function readJsonTool(args: ReadJsonArgs): Promise<string> {
  const filePath = resolve(args.path);
  const original = await readFile(filePath, "utf-8");
  const category = detectFileCategory(filePath);

  const options: JsonToToonOptions = {
    delimiter: args.delimiter,
    keyFolding: args.keyFolding,
  };

  let optimized: string;
  if (category === "jsonl") {
    optimized = jsonlToToon(original, options);
  } else {
    optimized = jsonToToon(original, options);
  }

  const metrics = calculateMetrics(original, optimized);
  const truncated = truncateToTokenLimit(optimized, args.maxTokens);

  return `${metrics.header}\n\n${truncated.content}`;
}
