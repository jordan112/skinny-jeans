export function minifyMarkdown(input: string): string {
  const lines = input.split("\n");
  const result: string[] = [];
  let inCodeBlock = false;
  let inFrontmatter = false;
  let frontmatterDone = false;
  let consecutiveBlanks = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Frontmatter detection (only at start of file)
    if (i === 0 && line.trim() === "---") {
      inFrontmatter = true;
      continue;
    }
    if (inFrontmatter) {
      if (line.trim() === "---") {
        inFrontmatter = false;
        frontmatterDone = true;
      }
      continue;
    }

    // Code block detection — never modify code blocks
    if (line.trimStart().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      consecutiveBlanks = 0;
      result.push(line);
      continue;
    }
    if (inCodeBlock) {
      result.push(line);
      continue;
    }

    // Strip HTML comments
    if (line.trim().startsWith("<!--") && line.trim().endsWith("-->")) {
      continue;
    }

    // Strip badge images: ![badge](url)
    if (/^\s*!\[.*?\]\(https?:\/\/.*?(badge|shield|img\.shields).*?\)\s*$/.test(line)) {
      continue;
    }

    // Strip standalone badge links: [![badge](img-url)](link-url)
    if (/^\s*\[!\[.*?\]\(https?:\/\/.*?(badge|shield|img\.shields).*?\)\]\(.*?\)\s*$/.test(line)) {
      continue;
    }

    // Handle blank lines: collapse 3+ consecutive → 1
    if (line.trim() === "") {
      consecutiveBlanks++;
      if (consecutiveBlanks <= 2) {
        result.push("");
      }
      continue;
    }
    consecutiveBlanks = 0;

    let processed = line;

    // Strip trailing # on ATX headings: "## Heading ##" → "## Heading"
    processed = processed.replace(/^(#{1,6}\s+.*?)\s+#+\s*$/, "$1");

    // Strip trailing whitespace
    processed = processed.trimEnd();

    result.push(processed);
  }

  // Remove trailing blank lines
  while (result.length > 0 && result[result.length - 1] === "") {
    result.pop();
  }

  return result.join("\n") + "\n";
}
