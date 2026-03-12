export interface TranslationPrompt {
  englishResponse: string;
  translationPrompt: string;
}

const TRANSLATION_INSTRUCTIONS = `Translate the following into natural Korean.

Preserve technical terms, code identifiers, class names, table names, API names, and acronyms in English.

Summarize only the key points.
Do not over-explain.`;

export function generateTranslationPrompt(
  englishResponse: string
): TranslationPrompt {
  const trimmed = englishResponse.trim();
  const translationPrompt = `${TRANSLATION_INSTRUCTIONS}\n\n${trimmed}`;
  return { englishResponse: trimmed, translationPrompt };
}
