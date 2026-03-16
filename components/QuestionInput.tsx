"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import type { ResponseLength } from "@/lib/promptTemplates";

interface QuestionInputProps {
  onSubmit: (question: string, responseLength: ResponseLength) => void;
  disabled?: boolean;
}

export default function QuestionInput({ onSubmit, disabled }: QuestionInputProps) {
  const [question, setQuestion] = useState("");
  const [responseLength, setResponseLength] = useState<ResponseLength>("normal");

  function handleSubmit() {
    const trimmed = question.trim();
    if (!trimmed) return;
    onSubmit(trimmed, responseLength);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const isEmpty = !question.trim() || !!disabled;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="한국어로 질문을 입력하세요"
        rows={4}
        className="w-full resize-none text-sm text-slate-800 dark:text-slate-200 bg-transparent placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none leading-relaxed px-4 pt-4 pb-2"
      />
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 dark:text-slate-500">응답 길이</span>
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden text-xs font-medium bg-white dark:bg-slate-700">
            {(["short", "normal"] as ResponseLength[]).map((len) => (
              <button
                key={len}
                type="button"
                onClick={() => setResponseLength(len)}
                className={`px-3 py-1.5 transition-colors ${
                  responseLength === len
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600"
                }`}
              >
                {len === "short" ? "짧게" : "보통"}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-300 dark:text-slate-600">{question.length}자</span>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isEmpty}
          className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          프롬프트 생성
        </button>
      </div>
    </div>
  );
}
