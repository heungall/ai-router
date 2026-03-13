"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { TranslationPrompt } from "@/lib/generateTranslationPrompt";

interface TranslationPromptOutputProps {
  result: TranslationPrompt | null;
}

export default function TranslationPromptOutput({
  result,
}: TranslationPromptOutputProps) {
  const [copied, setCopied] = useState(false);

  // Reset copied state whenever the result changes
  useEffect(() => {
    setCopied(false);
  }, [result]);

  if (!result) return null;

  async function handleCopy() {
    await navigator.clipboard.writeText(result!.translationPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          번역 프롬프트 — Claude에 붙여넣기
        </span>
        <button
          onClick={handleCopy}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            copied
              ? "bg-green-100 text-green-700"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
          }`}
        >
          {copied ? "복사됨!" : "복사"}
        </button>
      </div>
      <div className="p-4 text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none prose-pre:bg-gray-100 prose-pre:rounded-lg prose-code:text-pink-600 prose-code:before:content-none prose-code:after:content-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {result.translationPrompt}
        </ReactMarkdown>
      </div>
    </div>
  );
}
