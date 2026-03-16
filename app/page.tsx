"use client";

import { useState, useEffect } from "react";
import QuestionInput from "@/components/QuestionInput";
import PromptOutput from "@/components/PromptOutput";
import ResponseInput from "@/components/ResponseInput";
import TranslationOutput from "@/components/TranslationOutput";
import DebugPanel from "@/components/DebugPanel";
import ThemeToggle from "@/components/ThemeToggle";
import { generatePrompt, type GeneratedPrompt } from "@/lib/generatePrompt";
import { loadFillers } from "@/lib/fillerStore";
import { loadIntentRules, type IntentRule } from "@/lib/intentStore";
import type { ResponseLength } from "@/lib/promptTemplates";
import { translateWithLingva } from "@/lib/lingvaClient";

export default function Home() {
  const [promptResult, setPromptResult] = useState<GeneratedPrompt | null>(null);
  const [koreanText, setKoreanText] = useState<string | null>(null);
  const [questionProvider, setQuestionProvider] = useState<string | null>(null);
  const [responseProvider, setResponseProvider] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translatingResponse, setTranslatingResponse] = useState(false);
  const [fillers, setFillers] = useState<string[]>([]);
  const [intentRules, setIntentRules] = useState<IntentRule[]>([]);
  useEffect(() => {
    setFillers(loadFillers());
    setIntentRules(loadIntentRules());
  }, []);

  async function handleQuestionSubmit(question: string, responseLength: ResponseLength) {
    setTranslating(true);
    try {
      // Try Lingva client-side first (bypasses Vercel 403)
      const lingvaResult = await translateWithLingva(question, "ko", "en");
      if (lingvaResult) {
        setQuestionProvider("Lingva");
        setPromptResult(generatePrompt(question, responseLength, lingvaResult, fillers, intentRules));
        return;
      }
      // Fallback to server API (MyMemory)
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: question }),
      });
      const { translated, provider } = await res.json();
      setQuestionProvider(provider ?? null);
      setPromptResult(generatePrompt(question, responseLength, translated, fillers, intentRules));
    } catch {
      setQuestionProvider(null);
      setPromptResult(generatePrompt(question, responseLength, undefined, fillers, intentRules));
    } finally {
      setTranslating(false);
    }
  }

  async function handleResponseSubmit(englishText: string) {
    setTranslatingResponse(true);
    try {
      // Try Lingva client-side first (bypasses Vercel 403)
      const lingvaResult = await translateWithLingva(englishText, "en", "ko");
      if (lingvaResult) {
        setKoreanText(lingvaResult);
        setResponseProvider("Lingva");
        return;
      }
      // Fallback to server API (MyMemory + markdown shield/repair)
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: englishText, langpair: "en|ko" }),
      });
      const { translated, provider } = await res.json();
      setKoreanText(translated);
      setResponseProvider(provider ?? null);
    } catch {
      setKoreanText(null);
      setResponseProvider(null);
    } finally {
      setTranslatingResponse(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Top nav */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-10 transition-colors">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">AI Router</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">한국어 프롬프트 컴파일러</span>
          </div>
          <nav className="flex items-center gap-1">
            <a href="/intents" className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg px-3 py-1.5 transition-colors">
              의도 규칙
            </a>
            <a href="/fillers" className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg px-3 py-1.5 transition-colors">
              필터
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Step 1 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">질문 입력</h2>
            <span className="text-xs text-slate-400 dark:text-slate-500">한국어 → 최적화 영어 프롬프트</span>
          </div>
          <QuestionInput onSubmit={handleQuestionSubmit} disabled={translating} />
          {translating && (
            <div className="space-y-1 px-1">
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full animate-progress" />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">번역 중...</p>
            </div>
          )}
          <PromptOutput result={promptResult} />
          <DebugPanel result={promptResult} provider={questionProvider} />
        </section>

        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
          <span className="text-xs text-slate-400 dark:text-slate-500">Claude 응답을 받은 후</span>
          <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
        </div>

        {/* Step 2 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-400 dark:bg-slate-600 text-white text-xs font-bold">2</span>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">응답 번역</h2>
            <span className="text-xs text-slate-400 dark:text-slate-500">영어 응답 → 한국어</span>
          </div>
          <ResponseInput onSubmit={handleResponseSubmit} disabled={translatingResponse} />
          {translatingResponse && (
            <div className="space-y-1 px-1">
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full animate-progress" />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">번역 중...</p>
            </div>
          )}
          <TranslationOutput text={koreanText} provider={responseProvider} />
        </section>
      </main>
    </div>
  );
}
