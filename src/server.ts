import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileTool } from "./tools/read-file.js";
import { readJsonTool } from "./tools/read-json.js";
import { estimateTokensTool } from "./tools/estimate-tokens.js";
import { listFilesTool } from "./tools/list-files.js";
import { batchEstimateTool } from "./tools/batch-estimate.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "skinny-jeans",
    version: "1.0.0",
  });

  server.tool(
    "toon_read_file",
    "Read any file in token-optimized form. Auto-detects type: JSON→TOON, markdown→minified, code→comments stripped. Reports token savings.",
    {
      path: z.string().describe("File path to read"),
      maxTokens: z.number().optional().describe("Maximum tokens to return (truncates if exceeded)"),
      raw: z.boolean().optional().describe("If true, return raw content without optimization"),
    },
    async (args) => ({
      content: [{ type: "text" as const, text: await readFileTool(args) }],
    }),
  );

  server.tool(
    "toon_read_json",
    "Read a JSON or JSONL file encoded as TOON format (~40-60% fewer tokens). Supports delimiter and key folding options.",
    {
      path: z.string().describe("Path to JSON or JSONL file"),
      delimiter: z.enum(["comma", "tab", "pipe"]).optional().describe("Delimiter for tabular rows (default: tab)"),
      keyFolding: z.enum(["off", "safe"]).optional().describe("Collapse single-key wrappers into dotted paths (default: safe)"),
      maxTokens: z.number().optional().describe("Maximum tokens to return"),
    },
    async (args) => ({
      content: [{ type: "text" as const, text: await readJsonTool(args) }],
    }),
  );

  server.tool(
    "toon_estimate_tokens",
    "Estimate token count for a file or text string. Helps decide whether to use toon_read_file.",
    {
      path: z.string().optional().describe("File path to estimate"),
      text: z.string().optional().describe("Text string to estimate"),
    },
    async (args) => ({
      content: [{ type: "text" as const, text: await estimateTokensTool(args) }],
    }),
  );

  server.tool(
    "toon_list_files",
    "Compact directory listing as indented tree. No verbose metadata, skips hidden files and node_modules.",
    {
      path: z.string().describe("Directory path to list"),
      recursive: z.boolean().optional().describe("List files recursively (default: false)"),
      pattern: z.string().optional().describe("Filter by glob pattern (e.g. '*.ts')"),
    },
    async (args) => ({
      content: [{ type: "text" as const, text: await listFilesTool(args) }],
    }),
  );

  server.tool(
    "toon_batch_estimate",
    "Batch token savings report across files and directories. Shows estimated savings by file type.",
    {
      paths: z.array(z.string()).describe("File or directory paths to analyze"),
      recursive: z.boolean().optional().describe("Recurse into directories (default: true)"),
    },
    async (args) => ({
      content: [{ type: "text" as const, text: await batchEstimateTool(args) }],
    }),
  );

  return server;
}
