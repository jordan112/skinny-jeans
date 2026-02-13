import { extname } from "node:path";

export type FileCategory = "json" | "jsonl" | "markdown" | "code" | "text";

const EXT_MAP: Record<string, FileCategory> = {
  ".json": "json",
  ".jsonl": "jsonl",
  ".ndjson": "jsonl",
  ".md": "markdown",
  ".mdx": "markdown",
  ".ts": "code",
  ".tsx": "code",
  ".js": "code",
  ".jsx": "code",
  ".mjs": "code",
  ".cjs": "code",
  ".py": "code",
  ".rb": "code",
  ".go": "code",
  ".rs": "code",
  ".java": "code",
  ".kt": "code",
  ".swift": "code",
  ".c": "code",
  ".cpp": "code",
  ".h": "code",
  ".hpp": "code",
  ".cs": "code",
  ".php": "code",
  ".sh": "code",
  ".bash": "code",
  ".zsh": "code",
  ".yaml": "text",
  ".yml": "text",
  ".toml": "text",
  ".ini": "text",
  ".cfg": "text",
  ".conf": "text",
  ".txt": "text",
  ".csv": "text",
  ".tsv": "text",
  ".xml": "text",
  ".html": "text",
  ".css": "text",
  ".scss": "text",
  ".less": "text",
  ".sql": "code",
  ".graphql": "text",
  ".env": "text",
  ".gitignore": "text",
  ".dockerignore": "text",
};

export function detectFileCategory(filePath: string): FileCategory {
  const ext = extname(filePath).toLowerCase();
  return EXT_MAP[ext] ?? "text";
}

export function getCommentStyle(filePath: string): "c-style" | "hash" | "none" {
  const ext = extname(filePath).toLowerCase();
  const hashExts = new Set([".py", ".rb", ".sh", ".bash", ".zsh", ".yaml", ".yml"]);
  const cStyleExts = new Set([
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".go", ".rs", ".java", ".kt", ".swift",
    ".c", ".cpp", ".h", ".hpp", ".cs", ".php", ".sql",
  ]);
  if (hashExts.has(ext)) return "hash";
  if (cStyleExts.has(ext)) return "c-style";
  return "none";
}
