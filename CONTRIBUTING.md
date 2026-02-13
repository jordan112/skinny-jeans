# Contributing to skinny-jeans

Thanks for your interest in contributing! Here's how to get started.

## Development setup

```bash
git clone https://github.com/jordan112/skinny-jeans.git
cd skinny-jeans
npm install
npm run build
npm test
```

## Project structure

```
src/
├── index.ts                 # MCP server entry point (stdio transport)
├── server.ts                # McpServer setup + 5 tool registrations
├── cli.ts                   # CLI companion (skinny-jeans read|estimate|batch)
├── tools/                   # MCP tool implementations
│   ├── read-file.ts         # toon_read_file — primary tool, auto-detects type
│   ├── read-json.ts         # toon_read_json — JSON→TOON with options
│   ├── estimate-tokens.ts   # toon_estimate_tokens — quick token count
│   ├── list-files.ts        # toon_list_files — compact directory tree
│   └── batch-estimate.ts    # toon_batch_estimate — savings report
├── transforms/              # File content transforms
│   ├── json-to-toon.ts      # JSON/JSONL → TOON via @toon-format/toon
│   ├── markdown-minify.ts   # Markdown minification (state machine)
│   ├── code-strip.ts        # Comment stripping (C-style + hash)
│   └── generic-compress.ts  # Whitespace normalization fallback
└── utils/                   # Shared utilities
    ├── token-count.ts       # tokenx wrapper with LRU cache
    ├── file-detect.ts       # Extension → file category mapping
    ├── size-guard.ts        # Token-based truncation
    └── metrics.ts           # Savings calculation + header formatting
```

## Making changes

1. Create a branch from `main`
2. Make your changes
3. Run `npm run build` to check for TypeScript errors
4. Run `npm test` to verify all tests pass
5. Add tests for new functionality
6. Submit a pull request

## Adding a new transform

1. Create `src/transforms/your-transform.ts` with a function that takes a string and returns a string
2. Add the file extension mapping in `src/utils/file-detect.ts`
3. Wire it into `src/tools/read-file.ts` in the switch statement
4. Add tests in `test/transforms/your-transform.test.ts`
5. Add a fixture file in `test/fixtures/`

## Adding a new tool

1. Create `src/tools/your-tool.ts` with the implementation
2. Register it in `src/server.ts` using `server.tool()`
3. Add tests in `test/tools/your-tool.test.ts`

## Guidelines

- Keep transforms conservative — it's better to preserve something unnecessary than to strip something important
- Code blocks in markdown must never be modified
- Inline comments in code should be preserved (they carry context for the LLM)
- String literals containing comment-like syntax must not be stripped
- All transforms should be pure functions (string in, string out)
- Token counting uses heuristic estimation (tokenx) — it doesn't need to be exact

## Running the MCP server locally

```bash
npm run build
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | node dist/index.js
```

## Tests

```bash
npm test              # Run once
npm run test:watch    # Watch mode
```

All transforms have edge-case tests. When adding new functionality, check:
- Empty input
- Input with only whitespace
- Input with special characters
- Large input (performance)
- Mixed content (e.g., code blocks inside markdown)
