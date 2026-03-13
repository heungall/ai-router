/**
 * Repairs markdown syntax broken by translation APIs.
 * Common patterns: `* *` → `**`, `# #` → `##`, spaced backticks, etc.
 */
export function repairMarkdown(text: string): string {
  let result = text;

  // Fix headings: "# #" → "##", "# # #" → "###", etc.
  result = result.replace(/^(#{1,6})(?: #)+/gm, (match) => {
    const count = (match.match(/#/g) || []).length;
    return "#".repeat(count);
  });

  // Fix bold: "* *text* *" or "* * text * *" → "**text**"
  result = result.replace(/\* \*\s*/g, "**");
  result = result.replace(/\s*\* \*/g, "**");

  // Trim spaces inside bold markers: "** text **" → "**text**"
  result = result.replace(/\*\*\s+([^*\n]+?)\s+\*\*/g, "**$1**");
  result = result.replace(/\*\*\s+([^*\n]+?)\*\*/g, "**$1**");
  result = result.replace(/\*\*([^*\n]+?)\s+\*\*/g, "**$1**");

  // Fix italic left-overs: "* text *" → "*text*" (single asterisk with spaces)
  result = result.replace(/(?<!\*)\* ([^*\n]+?) \*(?!\*)/g, "*$1*");

  // Fix inline code: "` text `" → "`text`" (only matched pairs)
  result = result.replace(/` ([^`\n]+?) `/g, "`$1`");

  // Fix code fences: "`` `" or "` ` `" → "```" (line-start only)
  result = result.replace(/^` ` `(\w*)/gm, "```$1");
  result = result.replace(/^`` `(\w*)/gm, "```$1");
  result = result.replace(/^` ``\s*$/gm, "```");
  result = result.replace(/^`` `\s*$/gm, "```");

  // Fix table separators: "| - |" → "|---|"
  result = result.replace(/\|\s*-\s*\|/g, "|---|");
  result = result.replace(/\| -{3,} \|/g, "|---|");

  // Fix blockquote: "> " at line start is usually fine, but "& gt;" entity might appear
  result = result.replace(/&gt;/g, ">");

  return result;
}
