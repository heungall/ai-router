import { NextRequest, NextResponse } from "next/server";
import {
  shieldMarkdown,
  unshieldMarkdown,
  parseTable,
  reassembleTable,
} from "@/lib/markdownShield";
import { translateWithFallback } from "@/lib/translationProviders";

const CHUNK_LIMIT = 480;
const MAX_INPUT_LENGTH = 50_000;

function splitIntoChunks(text: string): string[] {
  if (text.length <= CHUNK_LIMIT) return [text];

  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?\n])\s+/);
  let current = "";

  for (const sentence of sentences) {
    if ((current + sentence).length > CHUNK_LIMIT) {
      if (current) chunks.push(current.trim());
      if (sentence.length > CHUNK_LIMIT) {
        for (let i = 0; i < sentence.length; i += CHUNK_LIMIT) {
          chunks.push(sentence.slice(i, i + CHUNK_LIMIT));
        }
        current = "";
      } else {
        current = sentence;
      }
    } else {
      current = current ? current + " " + sentence : sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/** Parse "ko|en" style langpair into { from, to } */
function parseLangpair(langpair: string): { from: string; to: string } {
  const [from, to] = langpair.split("|");
  return { from, to };
}

/**
 * Translates a markdown table cell-by-cell, preserving structure.
 */
async function translateTable(
  tableStr: string,
  from: string,
  to: string
): Promise<{ text: string; provider: string }> {
  const { header, separator, body } = parseTable(tableStr);

  const allCells = [...header, ...body.flat()];
  const toTranslate = allCells.filter(
    (c) => c.trim() && !/^-+$/.test(c.trim())
  );

  if (toTranslate.length === 0) return { text: tableStr, provider: "none" };

  // Deduplicate cells to avoid redundant API calls
  const uniqueCells = [...new Set(toTranslate)];

  const results = await Promise.all(
    uniqueCells.map((cell) => translateWithFallback(cell, from, to))
  );

  const translationMap = new Map<string, string>();
  uniqueCells.forEach((orig, i) => {
    translationMap.set(orig, results[i].text);
  });

  const trHeader = header.map((c) => translationMap.get(c) ?? c);
  const trBody = body.map((row) =>
    row.map((c) => translationMap.get(c) ?? c)
  );

  // Use the provider from the first successful translation
  const provider = results.find((r) => r.provider !== "none")?.provider ?? "none";

  return { text: reassembleTable(trHeader, separator, trBody), provider };
}

export async function POST(req: NextRequest) {
  const { text, langpair = "ko|en" } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ translated: "", provider: "none" });
  }
  if (text.length > MAX_INPUT_LENGTH) {
    return NextResponse.json({ error: "Input too large" }, { status: 413 });
  }
  const { from, to } = parseLangpair(langpair);

  // Shield markdown blocks (tables, code fences, inline code) before translation
  const { text: shielded, blocks } = shieldMarkdown(text);

  // Translate prose chunks
  const chunks = splitIntoChunks(shielded);
  const results = await Promise.all(
    chunks.map((c) => translateWithFallback(c, from, to))
  );
  const joined = results.map((r) => r.text).join(" ");

  // Track which provider was used (first successful chunk)
  let provider = results.find((r) => r.provider !== "none")?.provider ?? "none";

  // Translate table blocks cell-by-cell
  for (const block of blocks) {
    if (block.type === "table") {
      const tableResult = await translateTable(block.content, from, to);
      block.content = tableResult.text;
      if (provider === "none" && tableResult.provider !== "none") {
        provider = tableResult.provider;
      }
    }
  }

  // Restore shielded blocks
  const restored =
    blocks.length > 0 ? unshieldMarkdown(joined, blocks) : joined;

  return NextResponse.json({ translated: restored, provider });
}
