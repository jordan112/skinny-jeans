import { readdir, readFile, stat } from "node:fs/promises";
import { resolve, join, extname } from "node:path";
import { countTokens } from "../utils/token-count.js";
import { detectFileCategory, type FileCategory } from "../utils/file-detect.js";

export interface BatchEstimateArgs {
  paths: string[];
  recursive?: boolean;
}

interface FileStats {
  path: string;
  tokens: number;
  category: FileCategory;
  size: number;
}

export async function batchEstimateTool(args: BatchEstimateArgs): Promise<string> {
  const allFiles: FileStats[] = [];

  for (const p of args.paths) {
    const fullPath = resolve(p);
    const info = await stat(fullPath);

    if (info.isFile()) {
      await addFile(fullPath, allFiles);
    } else if (info.isDirectory()) {
      await collectFiles(fullPath, args.recursive ?? true, allFiles);
    }
  }

  if (allFiles.length === 0) {
    return "No text files found.";
  }

  // Group by category
  const byCategory = new Map<FileCategory, { count: number; tokens: number }>();
  let totalTokens = 0;

  for (const f of allFiles) {
    totalTokens += f.tokens;
    const existing = byCategory.get(f.category) ?? { count: 0, tokens: 0 };
    existing.count++;
    existing.tokens += f.tokens;
    byCategory.set(f.category, existing);
  }

  const savingsRates: Record<FileCategory, number> = {
    json: 0.45,
    jsonl: 0.45,
    markdown: 0.2,
    code: 0.15,
    text: 0.07,
  };

  let estimatedSaved = 0;
  const lines: string[] = [`Token Savings Report (${allFiles.length} files)`, ""];

  for (const [category, stats] of byCategory) {
    const rate = savingsRates[category];
    const saved = Math.round(stats.tokens * rate);
    estimatedSaved += saved;
    lines.push(
      `${category}: ${stats.count} files, ~${stats.tokens} tokens → save ~${saved} tokens (${Math.round(rate * 100)}%)`,
    );
  }

  lines.push("");
  lines.push(`Total: ~${totalTokens} tokens`);
  lines.push(`Estimated savings: ~${estimatedSaved} tokens (${Math.round((estimatedSaved / totalTokens) * 100)}%)`);

  return lines.join("\n");
}

async function addFile(filePath: string, results: FileStats[]): Promise<void> {
  try {
    const content = await readFile(filePath, "utf-8");
    const tokens = countTokens(content);
    const category = detectFileCategory(filePath);
    const info = await stat(filePath);
    results.push({ path: filePath, tokens, category, size: info.size });
  } catch {
    // Skip files that can't be read (binary, permission errors, etc.)
  }
}

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", "__pycache__", ".venv"]);

async function collectFiles(
  dirPath: string,
  recursive: boolean,
  results: FileStats[],
): Promise<void> {
  const items = await readdir(dirPath, { withFileTypes: true });

  for (const item of items) {
    if (item.name.startsWith(".") && item.name !== ".env") continue;
    const fullPath = join(dirPath, item.name);

    if (item.isDirectory()) {
      if (recursive && !SKIP_DIRS.has(item.name)) {
        await collectFiles(fullPath, true, results);
      }
    } else {
      const ext = extname(item.name).toLowerCase();
      // Skip binary-looking extensions
      if ([".png", ".jpg", ".gif", ".ico", ".woff", ".ttf", ".zip", ".tar", ".gz", ".exe", ".dll", ".so", ".dylib"].includes(ext)) continue;
      await addFile(fullPath, results);
    }
  }
}
