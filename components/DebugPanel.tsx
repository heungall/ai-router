"use client";

import type { ReactNode } from "react";
import type { GeneratedPrompt } from "@/lib/generatePrompt";
import { estimateTokens, estimateCost } from "@/lib/estimateTokens";

interface DebugPanelProps {
  result: GeneratedPrompt | null;
}

const INTENT_LABELS: Record<string, string> = {
  explain: "Explain",
  summarize: "Summarize",
  compare: "Compare",
  rewrite: "Rewrite",
  generate: "Generate",
  analyze: "Analyze",
  troubleshoot: "Troubleshoot",
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs font-medium text-slate-400 pt-0.5">{label}</span>
      <div className="text-xs text-slate-600">{children}</div>
    </div>
  );
}

export default function DebugPanel({ result }: DebugPanelProps) {
  if (!result) return null;

  const { originalQuestion, fillerResult, intentResult, optimizedPrompt } = result;

  const originalTokens = estimateTokens(originalQuestion);
  const optimizedTokens = estimateTokens(optimizedPrompt);
  const savedTokens = originalTokens - optimizedTokens;
  const savedPct = Math.round((savedTokens / originalTokens) * 100);

  return (
    <details className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <summary className="cursor-pointer px-4 py-3 flex items-center justify-between text-xs font-medium text-slate-400 select-none hover:bg-slate-50 transition-colors">
        <span>처리 과정 보기</span>
        <span className="group-open:rotate-180 transition-transform">▾</span>
      </summary>

      <div className="px-4 pb-3 pt-1 border-t border-slate-100">
        <Row label="원본 질문">{originalQuestion}</Row>

        <Row label="제거된 필러">
          {fillerResult.removedFillers.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {fillerResult.removedFillers.map((f) => (
                <span key={f} className="bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded text-xs">
                  {f}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-slate-300">없음</span>
          )}
        </Row>

        <Row label="정제된 질문">{fillerResult.cleanedText}</Row>

        <Row label="감지된 의도">
          <div className="flex items-center gap-2">
            <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full text-xs font-semibold">
              {INTENT_LABELS[intentResult.intent]}
            </span>
            {intentResult.matchedKeyword && (
              <span className="text-slate-400 text-xs">
                키워드: <span className="text-slate-600 font-medium">"{intentResult.matchedKeyword}"</span>
              </span>
            )}
          </div>
        </Row>

        <Row label="토큰 추정">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">원문 (한국어)</span>
              <span className="font-mono text-slate-600">~{originalTokens} <span className="text-slate-300">({estimateCost(originalTokens)})</span></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">최적화 프롬프트</span>
              <span className="font-mono text-slate-600">~{optimizedTokens} <span className="text-slate-300">({estimateCost(optimizedTokens)})</span></span>
            </div>
            {savedTokens > 0 ? (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">절감</span>
                <span className="font-mono text-emerald-600">−{savedTokens} tokens ({savedPct}%)</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">추가</span>
                <span className="font-mono text-amber-500">+{Math.abs(savedTokens)} tokens</span>
              </div>
            )}
            <div className={`mt-1 px-3 py-2 rounded-xl text-xs font-medium border ${
              originalTokens <= optimizedTokens
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}>
              {originalTokens <= optimizedTokens
                ? "💡 원문(한국어)이 더 효율적입니다."
                : "✅ 번역+템플릿 프롬프트가 더 효율적입니다."}
            </div>
            <p className="text-slate-300 text-xs">* claude-sonnet-4-6 기준 $3.00/1M input tokens</p>
          </div>
        </Row>
      </div>
    </details>
  );
}
