#!/usr/bin/env node
import { readFileTool } from "./tools/read-file.js";
import { estimateTokensTool } from "./tools/estimate-tokens.js";
import { batchEstimateTool } from "./tools/batch-estimate.js";

const [command, ...args] = process.argv.slice(2);

async function main() {
  switch (command) {
    case "read": {
      if (!args[0]) {
        console.error("Usage: skinny-jeans read <file> [--raw] [--max-tokens N]");
        process.exit(1);
      }
      const raw = args.includes("--raw");
      const maxIdx = args.indexOf("--max-tokens");
      const maxTokens = maxIdx >= 0 ? parseInt(args[maxIdx + 1], 10) : undefined;
      const result = await readFileTool({ path: args[0], raw, maxTokens });
      console.log(result);
      break;
    }
    case "estimate": {
      if (!args[0]) {
        console.error("Usage: skinny-jeans estimate <file>");
        process.exit(1);
      }
      const result = await estimateTokensTool({ path: args[0] });
      console.log(result);
      break;
    }
    case "batch": {
      if (!args[0]) {
        console.error("Usage: skinny-jeans batch <path...>");
        process.exit(1);
      }
      const result = await batchEstimateTool({ paths: args });
      console.log(result);
      break;
    }
    default:
      console.log("skinny-jeans — Token Optimization Toolkit");
      console.log("");
      console.log("Commands:");
      console.log("  read <file> [--raw] [--max-tokens N]  Read file in optimized form");
      console.log("  estimate <file>                       Estimate token count");
      console.log("  batch <path...>                       Batch savings report");
      break;
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
