/**
 * Translation provider abstraction with fallback cascade.
 * Order: Lingva (primary) → MyMemory (fallback)
 */

export interface TranslationResult {
  text: string;
  provider: string;
}

interface Provider {
  name: string;
  translate: (text: string, from: string, to: string) => Promise<string>;
}

// --- Lingva (primary, Google Translate proxy) ---
const lingva: Provider = {
  name: "Lingva",
  async translate(text, from, to) {
    const encoded = encodeURIComponent(text);
    const res = await fetch(
      `https://lingva.ml/api/v1/${from}/${to}/${encoded}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) throw new Error(`Lingva ${res.status}`);
    const data = await res.json();
    if (!data.translation) throw new Error("Lingva: no translation");
    return data.translation;
  },
};

// --- MyMemory (fallback) ---
const mymemory: Provider = {
  name: "MyMemory",
  async translate(text, from, to) {
    const langpair = `${from}|${to}`;
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) throw new Error(`MyMemory ${res.status}`);
    const data = await res.json();
    const translated = data.responseData?.translatedText ?? "";
    if (
      !translated ||
      translated.toUpperCase().includes("MYMEMORY WARNING")
    ) {
      throw new Error("MyMemory: rate limited");
    }
    return translated;
  },
};

const PROVIDERS: Provider[] = [lingva, mymemory];

/**
 * Translates text using the fallback cascade.
 * Returns the translated text and which provider succeeded.
 */
export async function translateWithFallback(
  text: string,
  from: string,
  to: string
): Promise<TranslationResult> {
  let lastError: Error | null = null;

  for (const provider of PROVIDERS) {
    try {
      const result = await provider.translate(text, from, to);
      return { text: result, provider: provider.name };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  // All providers failed — return original text
  return { text, provider: "none" };
}
