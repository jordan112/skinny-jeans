import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { readFileTool } from "../../src/tools/read-file.js";

const FIXTURES = resolve(import.meta.dirname, "../fixtures");

describe("readFileTool", () => {
  it("reads JSON file with TOON encoding and metrics header", async () => {
    const result = await readFileTool({ path: resolve(FIXTURES, "sample.json") });

    expect(result).toMatch(/\[skinny-jeans: \d+% smaller/);
    // Should contain TOON-encoded content (not raw JSON braces)
    expect(result).toContain("context");
  });

  it("reads markdown file with minification", async () => {
    const result = await readFileTool({ path: resolve(FIXTURES, "sample.md") });

    expect(result).toMatch(/\[skinny-jeans: \d+% smaller/);
    expect(result).not.toContain("img.shields.io");
  });

  it("reads TypeScript file with comment stripping", async () => {
    const result = await readFileTool({ path: resolve(FIXTURES, "sample.ts") });

    expect(result).toMatch(/\[skinny-jeans: \d+% smaller/);
    expect(result).not.toContain("// This is a file-level comment");
    expect(result).toContain("export async function loadConfig");
  });

  it("returns raw content when raw=true", async () => {
    const result = await readFileTool({
      path: resolve(FIXTURES, "sample.json"),
      raw: true,
    });

    expect(result).not.toMatch(/\[skinny-jeans:/);
    // Raw JSON should have braces
    expect(result).toContain("{");
  });

  it("respects maxTokens truncation", async () => {
    const full = await readFileTool({ path: resolve(FIXTURES, "sample.json") });
    const limited = await readFileTool({
      path: resolve(FIXTURES, "sample.json"),
      maxTokens: 10,
    });

    expect(limited.length).toBeLessThan(full.length);
    expect(limited).toContain("truncated");
  });
});
