import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  const { text, langpair = "ko|en" } = await req.json();

  const chunks = splitIntoChunks(text);
  const translated = await Promise.all(chunks.map((c) => translateChunk(c, langpair)));

  return NextResponse.json({ translated: translated.join(" ") });
}
