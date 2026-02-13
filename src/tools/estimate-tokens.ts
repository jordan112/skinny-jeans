import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { countTokens } from "../utils/token-count.js";
import { detectFileCategory } from "../utils/file-detect.js";

export interface EstimateTokensArgs {
  path?: string;
  text?: string;
}

export async function estimateTokensTool(args: EstimateTokensArgs): Promise<string> {
  if (args.text) {
    const tokens = countTokens(args.text);
    return `Estimated tokens: ~${tokens}`;
  }

  if (!args.path) {
    return "Error: provide either 'path' or 'text'";
  }

  const filePath = resolve(args.path);
  const info = await stat(filePath);

  if (!info.isFile()) {
    return `Error: ${args.path} is not a file`;
  }

  const content = await readFile(filePath, "utf-8");
  const tokens = countTokens(content);
  const category = detectFileCategory(filePath);
  const lines = content.split("\n").length;

  const savingsEstimate: Record<string, string> = {
    json: "40-60%",
    jsonl: "40-60%",
    markdown: "15-30%",
    code: "10-20%",
    text: "5-10%",
  };

  return [
    `File: ${args.path}`,
    `Size: ${info.size} bytes, ${lines} lines`,
    `Estimated tokens: ~${tokens}`,
    `Category: ${category}`,
    `Expected savings with skinny-jeans: ${savingsEstimate[category] ?? "5-10%"}`,
  ].join("\n");
}
