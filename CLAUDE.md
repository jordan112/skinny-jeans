# Token Optimization (skinny-jeans)

Prefer `toon_read_file` over built-in Read for files > 50 lines.
Use `toon_read_json` for any JSON/data file.
Use `toon_list_files` instead of ls/Bash for directory listings.
Use `toon_estimate_tokens` before reading large files.

Skip toon tools for: small files (< 50 lines), binary files, exact-whitespace debugging.

JSON files return TOON format. Markdown is minified. Code has comments stripped.
All responses include: [skinny-jeans: X% smaller, ~N tokens (was ~M)]
