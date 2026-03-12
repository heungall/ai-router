import type { IntentType } from "./detectIntent";

const STORAGE_KEY = "ai-router-intent-rules";

export interface IntentRule {
  intent: IntentType;
  keywords: string[];
}

// Priority order: first match wins. More specific intents before general ones.
export const DEFAULT_INTENT_RULES: IntentRule[] = [
  { intent: "summarize",    keywords: ["요약", "핵심", "정리", "간단히", "줄여", "짧게"] },
  { intent: "compare",      keywords: ["비교", "차이점", "차이", "어떤 게 나아", "어떤게 나아", "vs"] },
  { intent: "rewrite",      keywords: ["자연스럽게", "다듬", "수정", "고쳐", "리팩토링", "리팩터링", "바꿔"] },
  { intent: "generate",     keywords: ["추천", "아이디어", "만들어", "작성해", "짜줘", "써줘", "생성"] },
  { intent: "analyze",      keywords: ["병목", "성능", "느려", "최적화", "분석", "살펴"] },
  { intent: "troubleshoot", keywords: ["에러", "오류", "버그", "안 돼", "안돼", "왜 안", "안 됨", "실패", "dump", "ST22"] },
  { intent: "explain",      keywords: ["설명", "왜", "어떻게", "무엇", "뭐야", "뭔지", "알려줘", "이해"] },
];

export function loadIntentRules(): IntentRule[] {
  if (typeof window === "undefined") return DEFAULT_INTENT_RULES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as IntentRule[]) : DEFAULT_INTENT_RULES;
  } catch {
    return DEFAULT_INTENT_RULES;
  }
}

export function saveIntentRules(rules: IntentRule[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
}

export function resetIntentRules(): void {
  localStorage.removeItem(STORAGE_KEY);
}
