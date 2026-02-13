import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { stripComments } from "../../src/transforms/code-strip.js";

const FIXTURE = resolve(import.meta.dirname, "../fixtures/sample.ts");

describe("stripComments (C-style)", () => {
  it("strips single-line comments", async () => {
    const code = await readFile(FIXTURE, "utf-8");
    const result = stripComments(code, "sample.ts");

    expect(result).not.toContain("// This is a file-level comment");
    expect(result).not.toContain("// Another comment line");
    expect(result).not.toContain("// Read the config file");
    expect(result).not.toContain("// Filter empty lines");
    expect(result).not.toContain("// Helper function");
  });

  it("strips block comments", async () => {
    const code = await readFile(FIXTURE, "utf-8");
    const result = stripComments(code, "sample.ts");

    expect(result).not.toContain("JSDoc block comment");
    expect(result).not.toContain("Multi-line block comment");
  });

  it("preserves inline comments", async () => {
    const code = await readFile(FIXTURE, "utf-8");
    const result = stripComments(code, "sample.ts");

    // Lines with inline comments are kept as-is
    expect(result).toContain("inline comment stays");
    expect(result).toContain("inline");
  });

  it("preserves functional code", async () => {
    const code = await readFile(FIXTURE, "utf-8");
    const result = stripComments(code, "sample.ts");

    expect(result).toContain('import { readFile } from "fs/promises"');
    expect(result).toContain("export async function loadConfig");
    expect(result).toContain("export function transform");
    expect(result).toContain('console.log("hello")');
  });

  it("produces shorter output", async () => {
    const code = await readFile(FIXTURE, "utf-8");
    const result = stripComments(code, "sample.ts");

    expect(result.length).toBeLessThan(code.length);
  });
});

describe("stripComments (hash-style)", () => {
  it("strips Python comments", () => {
    const code = `# Comment line
import os

# Another comment
def main():
    x = 1  # inline stays
    print(x)
`;
    const result = stripComments(code, "example.py");

    expect(result).not.toMatch(/^# Comment line/m);
    expect(result).not.toMatch(/^# Another comment/m);
    expect(result).toContain("import os");
    expect(result).toContain("def main():");
    expect(result).toContain("x = 1  # inline stays");
  });

  it("preserves shebangs", () => {
    const code = `#!/usr/bin/env python
# A comment
print("hello")
`;
    const result = stripComments(code, "script.py");

    expect(result).toContain("#!/usr/bin/env python");
    expect(result).not.toContain("# A comment");
  });

  it("preserves triple-quote strings", () => {
    const code = `"""
# This looks like a comment but it's a docstring
"""
x = 1
`;
    const result = stripComments(code, "example.py");

    expect(result).toContain("# This looks like a comment but it's a docstring");
  });
});
