"use client";

import { useState, useEffect } from "react";
import type { GeneratedPrompt } from "@/lib/generatePrompt";
import { estimateTokens } from "@/lib/estimateTokens";

interface PromptOutputProps {
  result: GeneratedPrompt | null;
}

export default function PromptOutput({ result }: PromptOutputProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [result]);

  if (!result) return null;

  const originalTokens = estimateTokens(result.originalQuestion);
  const optimizedTokens = estimateTokens(result.optimizedPrompt);
  const originalIsEfficient = originalTokens <= optimizedTokens;

  async function handleCopy() {
    await navigator.clipboard.writeText(result!.optimizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          생성된 프롬프트
        </span>
        <button
          onClick={handleCopy}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            copied
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {copied ? "복사됨!" : "복사"}
        </button>
      </div>
      <pre className="px-4 py-4 text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
        {result.optimizedPrompt}
      </pre>
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 space-y-2">
        <p className="text-xs text-slate-400">
          원문이 영어로 번역되어 포함됩니다. 위 텍스트를 Claude에 그대로 붙여넣으세요.
        </p>
        <div className={`px-3 py-2 rounded-xl text-xs font-medium border ${
          originalIsEfficient
            ? "bg-amber-50 border-amber-200 text-amber-700"
            : "bg-emerald-50 border-emerald-200 text-emerald-700"
        }`}>
          {originalIsEfficient
            ? "💡 원문(한국어)을 Claude에 그대로 입력하는 것이 더 효율적입니다."
            : "✅ 번역+템플릿 프롬프트가 더 효율적입니다."}
        </div>
      </div>
    </div>
  );
}
