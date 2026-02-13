import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { jsonToToon, jsonlToToon } from "../../src/transforms/json-to-toon.js";
import { decode } from "@toon-format/toon";

const FIXTURE = resolve(import.meta.dirname, "../fixtures/sample.json");

describe("jsonToToon", () => {
  it("encodes JSON to valid TOON", async () => {
    const json = await readFile(FIXTURE, "utf-8");
    const toon = jsonToToon(json);

    // TOON output should be shorter
    expect(toon.length).toBeLessThan(json.length);

    // Should be decodable back
    const decoded = decode(toon, { expandPaths: "safe" });
    const original = JSON.parse(json);
    expect(decoded).toEqual(original);
  });

  it("respects delimiter option", async () => {
    const json = await readFile(FIXTURE, "utf-8");

    const toonTab = jsonToToon(json, { delimiter: "tab" });
    const toonComma = jsonToToon(json, { delimiter: "comma" });

    // Both should produce valid output
    expect(toonTab.length).toBeGreaterThan(0);
    expect(toonComma.length).toBeGreaterThan(0);

    // Tab should contain tabs in tabular rows
    expect(toonTab).toContain("\t");
  });

  it("handles simple values", () => {
    expect(jsonToToon('"hello"')).toContain("hello");
    expect(jsonToToon("42")).toContain("42");
    expect(jsonToToon("null")).toContain("null");
  });

  it("handles empty objects and arrays", () => {
    const emptyObj = jsonToToon("{}");
    const emptyArr = jsonToToon("[]");
    expect(emptyObj).toBeDefined();
    expect(emptyArr).toBeDefined();
  });
});

describe("jsonlToToon", () => {
  it("encodes JSONL to TOON array", () => {
    const jsonl = '{"a":1,"b":2}\n{"a":3,"b":4}\n';
    const toon = jsonlToToon(jsonl);

    expect(toon.length).toBeGreaterThan(0);

    const decoded = decode(toon) as Array<{ a: number; b: number }>;
    expect(decoded).toHaveLength(2);
    expect(decoded[0].a).toBe(1);
    expect(decoded[1].b).toBe(4);
  });
});
