// Rough token estimation without a tokenizer library.
// Korean Hangul syllable blocks (U+AC00–U+D7A3) cost ~2 tokens each in Claude's tokenizer.
// All other characters approximate ~4 chars per token.

// Claude claude-sonnet-4-6 pricing (as of 2025-03)
const INPUT_PRICE_PER_M_USD = 3.0; // $3.00 per 1M input tokens

export function estimateTokens(text: string): number {
  let count = 0;
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      count += 2;
    } else {
      count += 0.25;
    }
  }
  return Math.max(1, Math.ceil(count));
}

export function estimateCost(tokens: number): string {
  const usd = (tokens / 1_000_000) * INPUT_PRICE_PER_M_USD;
  if (usd < 0.0000001) return "<$0.0000001";
  return `$${usd.toFixed(7)}`;
}
