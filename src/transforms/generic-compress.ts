export function genericCompress(text: string): string {
  const lines = text.split("\n");
  const result: string[] = [];
  let consecutiveBlanks = 0;

  for (const line of lines) {
    // Strip trailing whitespace
    const trimmed = line.trimEnd();

    if (trimmed === "") {
      consecutiveBlanks++;
      // Collapse 3+ consecutive blank lines → 1
      if (consecutiveBlanks <= 2) {
        result.push("");
      }
      continue;
    }

    consecutiveBlanks = 0;
    result.push(trimmed);
  }

  // Remove trailing blank lines
  while (result.length > 0 && result[result.length - 1] === "") {
    result.pop();
  }

  return result.join("\n") + "\n";
}
