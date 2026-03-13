"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { repairMarkdown } from "@/lib/repairMarkdown";

interface TranslationOutputProps {
  text: string | null;
}

export default function TranslationOutput({ text }: TranslationOutputProps) {
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          한국어 번역
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
      <div className="px-4 py-4 text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none prose-pre:bg-slate-100 prose-pre:rounded-lg prose-code:text-pink-600 prose-code:before:content-none prose-code:after:content-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {repairedText}
        </ReactMarkdown>
      </div>
    </div>
  );
}
