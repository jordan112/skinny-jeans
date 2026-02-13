import { getCommentStyle } from "../utils/file-detect.js";

export function stripComments(code: string, filePath: string): string {
  const style = getCommentStyle(filePath);
  if (style === "none") return code;

  if (style === "hash") return stripHashComments(code);
  return stripCStyleComments(code);
}

function stripHashComments(code: string): string {
  const lines = code.split("\n");
  const result: string[] = [];
  let inMultilineString = false;
  let stringDelim = "";

  for (const line of lines) {
    const trimmed = line.trim();

    // Track triple-quote strings (Python)
    if (!inMultilineString) {
      if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
        stringDelim = trimmed.slice(0, 3);
        // Check if it closes on the same line
        if (trimmed.length > 3 && trimmed.endsWith(stringDelim)) {
          result.push(line);
          continue;
        }
        inMultilineString = true;
        result.push(line);
        continue;
      }
    } else {
      if (trimmed.includes(stringDelim)) {
        inMultilineString = false;
      }
      result.push(line);
      continue;
    }

    // Skip full-line comments (but keep shebangs)
    if (trimmed.startsWith("#") && !trimmed.startsWith("#!")) {
      continue;
    }

    // Skip blank lines
    if (trimmed === "") continue;

    result.push(line);
  }

  return result.join("\n") + "\n";
}

function stripCStyleComments(code: string): string {
  const lines = code.split("\n");
  const result: string[] = [];
  let inBlockComment = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Handle block comments
    if (inBlockComment) {
      if (trimmed.includes("*/")) {
        inBlockComment = false;
        const after = trimmed.slice(trimmed.indexOf("*/") + 2).trim();
        if (after) result.push(after);
      }
      continue;
    }

    // Full-line block comment start
    if (trimmed.startsWith("/*")) {
      if (trimmed.includes("*/")) {
        // Single-line block comment: /* ... */
        const after = trimmed.slice(trimmed.indexOf("*/") + 2).trim();
        if (after) result.push(after);
        continue;
      }
      inBlockComment = true;
      continue;
    }

    // Full-line single-line comment
    if (trimmed.startsWith("//")) {
      continue;
    }

    // Skip blank lines
    if (trimmed === "") continue;

    // Keep the line (including any inline comments — they carry context)
    result.push(line);
  }

  return result.join("\n") + "\n";
}
