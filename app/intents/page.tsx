"use client";

import { useState, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { loadIntentRules, saveIntentRules, resetIntentRules, DEFAULT_INTENT_RULES, type IntentRule } from "@/lib/intentStore";
import { INTENT_TEMPLATES } from "@/lib/promptTemplates";
import type { IntentType } from "@/lib/detectIntent";

const INTENT_LABELS: Record<IntentType, string> = {
  explain:      "Explain",
  summarize:    "Summarize",
  compare:      "Compare",
  rewrite:      "Rewrite",
  generate:     "Generate",
  analyze:      "Analyze",
  troubleshoot: "Troubleshoot",
};

export default function IntentsPage() {
  const [rules, setRules] = useState<IntentRule[]>([]);
  const [inputs, setInputs] = useState<Record<IntentType, string>>({
    explain: "", summarize: "", compare: "", rewrite: "",
    generate: "", analyze: "", troubleshoot: "",
  });

  useEffect(() => {
    setRules(loadIntentRules());
  }, []);

  function addKeyword(intent: IntentType) {
    const trimmed = inputs[intent].trim();
    const rule = rules.find((r) => r.intent === intent);
    if (!trimmed || !rule || rule.keywords.includes(trimmed)) return;

    const updated = rules.map((r) =>
      r.intent === intent ? { ...r, keywords: [...r.keywords, trimmed] } : r
    );
    setRules(updated);
    saveIntentRules(updated);
    setInputs((prev) => ({ ...prev, [intent]: "" }));
  }

  function deleteKeyword(intent: IntentType, keyword: string) {
    const updated = rules.map((r) =>
      r.intent === intent ? { ...r, keywords: r.keywords.filter((k) => k !== keyword) } : r
    );
    setRules(updated);
    saveIntentRules(updated);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>, intent: IntentType) {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword(intent);
    }
  }

  function handleReset() {
    resetIntentRules();
    setRules(DEFAULT_INTENT_RULES);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors text-sm">←</a>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">의도 규칙 관리</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
          >
            기본값으로 초기화
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <p className="text-xs text-slate-400 dark:text-slate-500">의도 감지에 사용되는 키워드와 프롬프트 템플릿을 관리합니다. 우선순위 순서로 평가됩니다.</p>

        <div className="space-y-3">
          {rules.map((rule, index) => (
            <div key={rule.intent} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <span className="text-xs font-mono text-slate-300 dark:text-slate-600">#{index + 1}</span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                  {INTENT_LABELS[rule.intent]}
                </span>
                <span className="ml-auto font-mono text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 px-2 py-0.5 rounded">
                  {INTENT_TEMPLATES[rule.intent].split("\n")[0]}
                </span>
              </div>

              {/* Keywords + Add */}
              <div className="px-4 py-3 space-y-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {rule.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="flex items-center gap-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => deleteKeyword(rule.intent, kw)}
                        className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {rule.keywords.length === 0 && (
                    <span className="text-xs text-slate-300 dark:text-slate-600">키워드 없음 — 기본값(explain)으로 처리됩니다.</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputs[rule.intent]}
                    onChange={(e) => setInputs((prev) => ({ ...prev, [rule.intent]: e.target.value }))}
                    onKeyDown={(e) => handleKeyDown(e, rule.intent)}
                    placeholder="키워드 추가"
                    className="flex-1 text-xs border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 bg-transparent placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => addKeyword(rule.intent)}
                    disabled={!inputs[rule.intent].trim()}
                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    추가
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
