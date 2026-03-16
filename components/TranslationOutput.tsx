"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { repairMarkdown } from "@/lib/repairMarkdown";

interface TranslationOutputProps {
  text: string | null;
  provider?: string | null;
}

export default function TranslationOutput({ text, provider }: TranslationOutputProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [text]);

  if (!text) return null;

  const repairedText = repairMarkdown(text);

  async function handleCopy() {
    await navigator.clipboard.writeText(repairedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          한국어 번역
        </span>
        <button
          onClick={handleCopy}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            copied
              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
          }`}
        >
          {copied ? "복사됨!" : "복사"}
        </button>
      </div>
      <div className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-pre:bg-slate-100 dark:prose-pre:bg-slate-900 prose-pre:rounded-lg prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:before:content-none prose-code:after:content-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {repairedText}
        </ReactMarkdown>
      </div>
      {provider && provider !== "none" && (
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <span className="text-xs text-slate-300 dark:text-slate-600">translated by {provider}</span>
        </div>
      )}
    </div>
  );
}
