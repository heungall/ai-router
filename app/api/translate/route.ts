import { NextRequest, NextResponse } from "next/server";
import {
  shieldMarkdown,
  unshieldMarkdown,
  parseTable,
  reassembleTable,
} from "@/lib/markdownShield";

const CHUNK_LIMIT = 480;

function splitIntoChunks(text: string): string[] {
  if (text.length <= CHUNK_LIMIT) return [text];

  const chunks: string[] = [];
  // Split on sentence boundaries first (\n, ., !, ?)
  const sentences = text.split(/(?<=[.!?\n])\s+/);
  let current = "";

  for (const sentence of sentences) {
    if ((current + sentence).length > CHUNK_LIMIT) {
      if (current) chunks.push(current.trim());
      // If single sentence exceeds limit, hard-split it
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

async function translateChunk(text: string, langpair: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.responseData?.translatedText ?? text;
}

/**
 * Translates a markdown table cell-by-cell, preserving structure.
 */
async function translateTable(
  tableStr: string,
  langpair: string
): Promise<string> {
  const { header, separator, body } = parseTable(tableStr);

  // Collect all cells that need translation
  const allCells = [...header, ...body.flat()];

  // Skip empty cells and separator-like cells
  const toTranslate = allCells.filter(
    (c) => c.trim() && !/^-+$/.test(c.trim())
  );

  // Batch translate: send all cells as one request separated by newlines
  // to minimize API calls, then split back
  if (toTranslate.length === 0) return tableStr;

  // Translate all cells in parallel
  const translated = await Promise.all(
    toTranslate.map((cell) => translateChunk(cell, langpair))
  );

  // Build a map from original → translated
  const translationMap = new Map<string, string>();
  toTranslate.forEach((orig, i) => {
    translationMap.set(orig, translated[i]);
  });

  // Apply translations
  const trHeader = header.map(
    (c) => translationMap.get(c) ?? c
  );
  const trBody = body.map((row) =>
    row.map((c) => translationMap.get(c) ?? c)
  );

  return reassembleTable(trHeader, separator, trBody);
}

export async function POST(req: NextRequest) {
  const { text, langpair = "ko|en" } = await req.json();

  // Shield markdown blocks (tables, code fences, inline code) before translation
  const { text: shielded, blocks } = shieldMarkdown(text);

  // Translate prose
  const chunks = splitIntoChunks(shielded);
  const translated = await Promise.all(
    chunks.map((c) => translateChunk(c, langpair))
  );
  const joined = translated.join(" ");

  // Translate table blocks cell-by-cell
  for (const block of blocks) {
    if (block.type === "table") {
      block.content = await translateTable(block.content, langpair);
    }
  }

  // Restore shielded blocks
  const restored =
    blocks.length > 0 ? unshieldMarkdown(joined, blocks) : joined;

  return NextResponse.json({ translated: restored });
}
