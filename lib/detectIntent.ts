import { DEFAULT_INTENT_RULES, type IntentRule } from "./intentStore";

export type IntentType =
  | "explain"
  | "summarize"
  | "compare"
  | "rewrite"
  | "generate"
  | "analyze"
  | "troubleshoot";

export interface IntentResult {
  intent: IntentType;
  matchedKeyword: string | null;
}

export function detectIntent(question: string, rules: IntentRule[] = DEFAULT_INTENT_RULES): IntentResult {
  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      if (question.includes(keyword)) {
        return { intent: rule.intent, matchedKeyword: keyword };
      }
    }
  }
  return { intent: "explain", matchedKeyword: null };
}
