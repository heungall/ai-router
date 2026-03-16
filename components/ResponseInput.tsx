"use client";

import { useState } from "react";

interface ResponseInputProps {
  onSubmit: (englishText: string) => void;
  disabled?: boolean;
}

export default function ResponseInput({ onSubmit, disabled }: ResponseInputProps) {
  const [text, setText] = useState("");

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  const isEmpty = !text.trim() || !!disabled;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Claude의 영어 응답을 여기에 붙여넣으세요"
        rows={5}
        className="w-full resize-none text-sm text-slate-800 dark:text-slate-200 bg-transparent placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none leading-relaxed px-4 pt-4 pb-2"
      />
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <span className="text-xs text-slate-300 dark:text-slate-600">{text.length}자</span>
        <div className="flex items-center gap-2">
          {text && (
            <button
              type="button"
              onClick={() => setText("")}
              className="text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              지우기
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isEmpty}
            className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            한국어로 번역
          </button>
        </div>
      </div>
    </div>
  );
}
