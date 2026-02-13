import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { minifyMarkdown } from "../../src/transforms/markdown-minify.js";

const FIXTURE = resolve(import.meta.dirname, "../fixtures/sample.md");

describe("minifyMarkdown", () => {
  it("strips frontmatter", async () => {
    const md = await readFile(FIXTURE, "utf-8");
    const result = minifyMarkdown(md);

    expect(result).not.toContain("title: Sample README");
    expect(result).not.toContain("author: Test");
  });

  it("strips badge images", async () => {
    const md = await readFile(FIXTURE, "utf-8");
    const result = minifyMarkdown(md);

    expect(result).not.toContain("img.shields.io");
    expect(result).not.toContain("Build Status");
  });

  it("strips HTML comments", async () => {
    const md = await readFile(FIXTURE, "utf-8");
    const result = minifyMarkdown(md);

    expect(result).not.toContain("<!-- This is an HTML comment");
  });

  it("strips trailing # on headings", async () => {
    const md = await readFile(FIXTURE, "utf-8");
    const result = minifyMarkdown(md);

    // "# My Project ##" should become "# My Project"
    expect(result).toContain("# My Project");
    expect(result).not.toMatch(/# My Project\s*##/);
  });

  it("collapses excessive blank lines", async () => {
    const md = await readFile(FIXTURE, "utf-8");
    const result = minifyMarkdown(md);

    // Should not have 3+ consecutive blank lines
    expect(result).not.toMatch(/\n\n\n\n/);
  });

  it("preserves code blocks untouched", async () => {
    const md = await readFile(FIXTURE, "utf-8");
    const result = minifyMarkdown(md);

    expect(result).toContain("npm install my-project");
    expect(result).toContain("# This comment inside code block should be preserved");
    expect(result).toContain("// This comment in code block should stay");
  });

  it("strips trailing whitespace", async () => {
    const md = await readFile(FIXTURE, "utf-8");
    const result = minifyMarkdown(md);

    const lines = result.split("\n");
    for (const line of lines) {
      expect(line).toBe(line.trimEnd());
    }
  });

  it("produces shorter output", async () => {
    const md = await readFile(FIXTURE, "utf-8");
    const result = minifyMarkdown(md);

    expect(result.length).toBeLessThan(md.length);
  });
});
