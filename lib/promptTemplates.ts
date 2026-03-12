import type { IntentType } from "./detectIntent";

export type ResponseLength = "short" | "normal";

export const INTENT_TEMPLATES: Record<IntentType, string> = {
  explain:      "Explain:\n{topic}",
  summarize:    "Summarize:\n{topic}",
  compare:      "Compare:\n{topic}",
  rewrite:      "Rewrite for clarity:\n{topic}",
  generate:     "Generate:\n{topic}",
  analyze:      "Analyze:\n{topic}",
  troubleshoot: "Troubleshoot:\n{topic}",
};

export const RESPONSE_STYLE = "Preserve technical terms exactly.";

export const LENGTH_CONSTRAINTS: Record<ResponseLength, string> = {
  short:  "Be concise.",
  normal: "Be thorough.",
};

export function applyTemplate(
  topic: string,
  intent: IntentType,
  responseLength: ResponseLength
): string {
  const body = INTENT_TEMPLATES[intent].replace("{topic}", topic);
  return `${body}\n\n${RESPONSE_STYLE} ${LENGTH_CONSTRAINTS[responseLength]}`;
}
