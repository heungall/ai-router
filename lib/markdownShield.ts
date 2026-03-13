/**
 * Extracts markdown structural blocks (tables, code fences) before translation,
 * replacing them with numbered placeholders. After translation, restores them.
 */

export interface ShieldBlock {
  type: "code" | "table" | "inline-code";
  content: string;
}

export interface ShieldResult {
  text: string;
  blocks: ShieldBlock[];
}

// Use unicode brackets as placeholder — translation APIs won't touch these
const PH = (i: number) => `⟪${i}⟫`;

/**
 * Shields markdown blocks that would be destroyed by a translation API.
 * Returns the text with placeholders and the extracted blocks.
 */
export function shieldMarkdown(text: string): ShieldResult {
  const blocks: ShieldBlock[] = [];
  let result = text;

  // Shield fenced code blocks: ```...```
  result = result.replace(/```[\w]*\n[\s\S]*?```/g, (match) => {
    const idx = blocks.length;
    blocks.push({ type: "code", content: match });
    return PH(idx);
  });

  // Shield tables: consecutive lines starting with |
  result = result.replace(/(?:^\|.*\|[ \t]*\n?){2,}/gm, (match) => {
    const idx = blocks.length;
    blocks.push({ type: "table", content: match.trimEnd() });
    return PH(idx);
  });

  // Shield inline code: `...` (keep them untranslated)
  result = result.replace(/`[^`\n]+`/g, (match) => {
    const idx = blocks.length;
    blocks.push({ type: "inline-code", content: match });
    return PH(idx);
  });

  return { text: result, blocks };
}

/**
 * Restores shielded blocks back into the translated text.
 */
export function unshieldMarkdown(text: string, blocks: ShieldBlock[]): string {
  let result = text;
  for (let i = 0; i < blocks.length; i++) {
    const placeholder = PH(i);
    const idx = result.indexOf(placeholder);
    if (idx !== -1) {
      const before = result.substring(0, idx).replace(/[ \t]+$/, "");
      const after = result.substring(idx + placeholder.length).replace(/^[ \t]+/, "");
      result = before + "\n" + blocks[i].content + "\n" + after;
    }
  }
  return result;
}

/**
 * Parses a markdown table into rows of cells.
 * Returns { header, separator, body } where each row is string[].
 */
export function parseTable(tableStr: string): {
  header: string[];
  separator: string;
  body: string[][];
} {
  const lines = tableStr.split("\n").filter((l) => l.trim());
  const parseRow = (line: string): string[] =>
    line
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());

  const header = parseRow(lines[0]);
  const separator = lines[1];
  const body = lines.slice(2).map(parseRow);

  return { header, separator, body };
}

/**
 * Reassembles a markdown table from translated parts.
 */
export function reassembleTable(
  header: string[],
  separator: string,
  body: string[][]
): string {
  const row = (cells: string[]) => "| " + cells.join(" | ") + " |";
  return [row(header), separator, ...body.map(row)].join("\n");
}
