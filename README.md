# skinny-jeans 👖

**Squeeze your context into skinny jeans.**

An MCP server that transparently serves files to [Claude Code](https://docs.anthropic.com/en/docs/claude-code) in token-optimized form. JSON files shrink ~40-60%. Markdown drops ~15-30%. Code loses comment bloat. Every file read costs fewer tokens — automatically.

## Why

Every file read in Claude Code consumes tokens from your API quota. Markdown is verbose (frontmatter, badges, blank lines). JSON repeats field names in every object. Comments in code are helpful for humans but noise for LLMs that already understand the code.

skinny-jeans sits between Claude and your filesystem as an MCP server, compressing content on the fly:

```
Claude Code  ──>  skinny-jeans (MCP)  ──>  reads file from disk
                        │
                        ├── .json/.jsonl  →  TOON encoding     ~40-60% savings
                        ├── .md/.mdx      →  markdown minify   ~15-30% savings
                        ├── .ts/.js/.py   →  comment stripping ~10-20% savings
                        └── other text    →  whitespace cleanup ~5% savings
```

## How it works

skinny-jeans uses [TOON](https://github.com/toon-format/toon) (Token-Oriented Object Notation) for JSON — a format purpose-built for LLM consumption that achieves ~40% fewer tokens with *better* LLM comprehension accuracy (73.9% vs JSON's 69.7%).

**Before (JSON, ~96 tokens):**
```json
{
  "hikes": [
    {"id": 1, "name": "Blue Lake Trail", "distanceKm": 7.5, "difficulty": "moderate"},
    {"id": 2, "name": "Ridge Overlook", "distanceKm": 9.2, "difficulty": "hard"},
    {"id": 3, "name": "Meadow Loop", "distanceKm": 3.1, "difficulty": "easy"}
  ]
}
```

**After (TOON, ~51 tokens — 47% smaller):**
```
hikes[3]{id	name	distanceKm	difficulty}:
  1	Blue Lake Trail	7.5	moderate
  2	Ridge Overlook	9.2	hard
  3	Meadow Loop	3.1	easy
```

## Quick start

### Install

```bash
npm install skinny-jeans
```

### Register with Claude Code

```bash
claude mcp add --scope user --transport stdio skinny-jeans -- node /path/to/node_modules/skinny-jeans/dist/index.js
```

Or clone and build from source:

```bash
git clone https://github.com/jordan112/skinny-jeans.git
cd skinny-jeans
npm install && npm run build
claude mcp add --scope user --transport stdio skinny-jeans -- node $(pwd)/dist/index.js
```

### Add to CLAUDE.md

Add this to your project's `CLAUDE.md` (or copy the included one):

```markdown
# Token Optimization (skinny-jeans)

Prefer `toon_read_file` over built-in Read for files > 50 lines.
Use `toon_read_json` for any JSON/data file.
Use `toon_list_files` instead of ls/Bash for directory listings.
Use `toon_estimate_tokens` before reading large files.
```

### Verify it works

Start a Claude Code session and run `/mcp` — you should see `skinny-jeans` with 5 tools listed.

## MCP Tools

| Tool | Purpose |
|---|---|
| `toon_read_file(path)` | Read any file in optimized form. Auto-detects type, applies the right transform, reports savings. |
| `toon_read_json(path)` | JSON/JSONL to TOON with encoding options (delimiter, key folding). |
| `toon_estimate_tokens(path\|text)` | Estimate token count without reading the full file. |
| `toon_list_files(path)` | Compact directory listing as indented tree (no verbose metadata). |
| `toon_batch_estimate(paths)` | Batch token savings report across files/directories. |

### toon_read_file

The primary tool. Reads any file and automatically applies the right optimization:

```
toon_read_file({ path: "data.json" })
→ [skinny-jeans: 47% smaller, ~51 tokens (was ~96)]
→ TOON-encoded content

toon_read_file({ path: "README.md" })
→ [skinny-jeans: 22% smaller, ~145 tokens (was ~186)]
→ Minified markdown (no badges, frontmatter, excess blanks)

toon_read_file({ path: "app.ts" })
→ [skinny-jeans: 15% smaller, ~171 tokens (was ~201)]
→ Code with comments stripped
```

**Parameters:**
- `path` (string, required) — file path
- `maxTokens` (number, optional) — truncate output at this token count
- `raw` (boolean, optional) — skip optimization, return original content

### toon_read_json

Specialized for JSON with encoding options:

- `delimiter` — `"tab"` (default), `"comma"`, or `"pipe"` for tabular rows
- `keyFolding` — `"safe"` (default) collapses `{"a": {"b": 1}}` into `a.b: 1`

### toon_estimate_tokens

Quick check before committing to a full read:

```
toon_estimate_tokens({ path: "big-dataset.json" })
→ File: big-dataset.json
→ Size: 245891 bytes, 4521 lines
→ Estimated tokens: ~52340
→ Category: json
→ Expected savings with skinny-jeans: 40-60%
```

### toon_batch_estimate

Analyze an entire project:

```
toon_batch_estimate({ paths: ["src/", "data/"] })
→ Token Savings Report (47 files)
→ json: 12 files, ~45200 tokens → save ~20340 tokens (45%)
→ code: 28 files, ~31000 tokens → save ~4650 tokens (15%)
→ markdown: 7 files, ~8900 tokens → save ~1780 tokens (20%)
→ Total: ~85100 tokens
→ Estimated savings: ~26770 tokens (31%)
```

## CLI

skinny-jeans also works as a standalone CLI:

```bash
# Read a file with optimization
skinny-jeans read data.json

# Estimate tokens for a file
skinny-jeans estimate large-file.ts

# Batch savings report
skinny-jeans batch src/ data/ docs/
```

## Transforms

### JSON/JSONL → TOON
Uses the [@toon-format/toon](https://github.com/toon-format/toon) encoder. Arrays of objects become tabular rows with shared headers. Nested keys are folded into dotted paths. Tab delimiters tokenize better than commas.

### Markdown minification
Line-by-line state machine that strips: YAML frontmatter, HTML comments, badge images, trailing `#` on headings, excess blank lines, trailing whitespace. Preserves: code blocks (never touched), tables, links, blockquotes.

### Code comment stripping
Removes full-line `//` and `/* */` comments (C-style languages) and `#` comments (Python, Ruby, shell). Preserves inline comments (they carry context) and string literals containing comment-like syntax.

### Generic compression
Fallback for other text files: collapses 3+ consecutive blank lines to 1, strips trailing whitespace.

## Expected token savings

| File Type | Typical Savings |
|---|---|
| JSON (tabular/array data) | 40-60% |
| JSON (nested config) | 20-35% |
| Markdown (README with badges) | 15-30% |
| TypeScript/JavaScript | 10-20% |
| Python | 10-25% |
| Other text | 5-10% |

## Development

```bash
git clone https://github.com/jordan112/skinny-jeans.git
cd skinny-jeans
npm install
npm run build
npm test
```

### Running locally

```bash
# Test the MCP server directly
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | node dist/index.js

# Register for development
claude mcp add --scope user --transport stdio skinny-jeans -- node $(pwd)/dist/index.js
```

## How it integrates with Claude Code

skinny-jeans is an [MCP server](https://modelcontextprotocol.io/) that communicates over stdio. When registered with Claude Code, its tools appear alongside Claude's built-in tools. The `CLAUDE.md` file instructs Claude to prefer skinny-jeans tools for file reading, so optimization happens transparently.

This is the only viable approach for transparent token optimization in Claude Code — hooks can run commands pre/post tool use but cannot modify tool output.

## License

MIT
