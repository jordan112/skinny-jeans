import { encode, type Delimiter, DELIMITERS } from "@toon-format/toon";

export interface JsonToToonOptions {
  delimiter?: "comma" | "tab" | "pipe";
  keyFolding?: "off" | "safe";
}

export function jsonToToon(jsonString: string, options?: JsonToToonOptions): string {
  const parsed = JSON.parse(jsonString);
  const delimiter: Delimiter = options?.delimiter
    ? DELIMITERS[options.delimiter]
    : DELIMITERS.tab;

  return encode(parsed, {
    delimiter,
    keyFolding: options?.keyFolding ?? "safe",
  });
}

export function jsonlToToon(jsonlString: string, options?: JsonToToonOptions): string {
  const lines = jsonlString.trim().split("\n").filter(Boolean);
  const objects = lines.map((line) => JSON.parse(line));

  const delimiter: Delimiter = options?.delimiter
    ? DELIMITERS[options.delimiter]
    : DELIMITERS.tab;

  return encode(objects, {
    delimiter,
    keyFolding: options?.keyFolding ?? "safe",
  });
}
