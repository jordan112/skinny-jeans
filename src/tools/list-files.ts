import { readdir, stat } from "node:fs/promises";
import { resolve, relative, join } from "node:path";

export interface ListFilesArgs {
  path: string;
  recursive?: boolean;
  pattern?: string;
}

interface FileEntry {
  name: string;
  isDir: boolean;
  size: number;
}

export async function listFilesTool(args: ListFilesArgs): Promise<string> {
  const dirPath = resolve(args.path);
  const entries = await collectEntries(dirPath, args.recursive ?? false, args.pattern);

  if (entries.length === 0) {
    return `(empty directory: ${args.path})`;
  }

  const lines: string[] = [];
  for (const entry of entries) {
    const rel = relative(dirPath, entry.path);
    const depth = rel.split("/").length - 1;
    const indent = "  ".repeat(depth);
    const suffix = entry.isDir ? "/" : ` (${formatSize(entry.size)})`;
    lines.push(`${indent}${entry.name}${suffix}`);
  }

  return lines.join("\n");
}

interface CollectedEntry {
  path: string;
  name: string;
  isDir: boolean;
  size: number;
}

async function collectEntries(
  dirPath: string,
  recursive: boolean,
  pattern?: string,
): Promise<CollectedEntry[]> {
  const result: CollectedEntry[] = [];
  const items = await readdir(dirPath, { withFileTypes: true });

  // Sort: directories first, then files, alphabetical
  items.sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  for (const item of items) {
    // Skip hidden files and common noise
    if (item.name.startsWith(".") || item.name === "node_modules") continue;

    const fullPath = join(dirPath, item.name);

    if (pattern && !matchPattern(item.name, pattern)) {
      if (item.isDirectory() && recursive) {
        const children = await collectEntries(fullPath, true, pattern);
        result.push(...children);
      }
      continue;
    }

    if (item.isDirectory()) {
      result.push({ path: fullPath, name: item.name, isDir: true, size: 0 });
      if (recursive) {
        const children = await collectEntries(fullPath, true, pattern);
        result.push(...children);
      }
    } else {
      const info = await stat(fullPath);
      result.push({ path: fullPath, name: item.name, isDir: false, size: info.size });
    }
  }

  return result;
}

function matchPattern(name: string, pattern: string): boolean {
  // Simple glob: *.ts, *.json, etc.
  const regex = pattern
    .replace(/\./g, "\\.")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp(`^${regex}$`, "i").test(name);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}
