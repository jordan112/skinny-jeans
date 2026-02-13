// This is a file-level comment that should be stripped
// Another comment line

import { readFile } from "fs/promises";

/**
 * This is a JSDoc block comment.
 * It should be stripped.
 */
export async function loadConfig(path: string): Promise<Record<string, unknown>> {
  // Read the config file
  const content = await readFile(path, "utf-8");
  const parsed = JSON.parse(content); // inline comment stays
  return parsed;
}

/*
 * Multi-line block comment
 * that spans several lines
 */
export function transform(data: string): string {
  const lines = data.split("\n");

  // Filter empty lines
  const filtered = lines.filter((line) => line.trim() !== "");

  return filtered.join("\n");
}

// Helper function
function helper(): void {
  console.log("hello"); // inline
}
