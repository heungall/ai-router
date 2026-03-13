"use client";

import { useState, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { loadFillers, saveFillers, resetFillers, DEFAULT_FILLERS } from "@/lib/fillerStore";

export default function FillersPage() {
  const [fillers, setFillers] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    setFillers(loadFillers());
  }, []);

  function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed || fillers.includes(trimmed)) return;
    const updated = [trimmed, ...fillers];
    setFillers(updated);
    saveFillers(updated);
    setInput("");
  }

  function handleDelete(filler: string) {
    const updated = fillers.filter((f) => f !== filler);
    setFillers(updated);
    saveFillers(updated);
  }

  function handleReset() {
    resetFillers();
    setFillers(DEFAULT_FILLERS);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="text-slate-400 hover:text-slate-600 transition-colors text-sm">←</a>
            <span className="text-sm font-semibold text-slate-800">필터 단어 관리</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            기본값으로 초기화
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <p className="text-xs text-slate-400">질문에서 제거할 한국어 필터 단어를 관리합니다.</p>

        {/* Add */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="필터 단어 추가"
              className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!input.trim()}
              className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              추가
            </button>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              목록 ({fillers.length}개)
            </span>
          </div>
          <ul className="divide-y divide-slate-50">
            {fillers.map((filler) => (
              <li key={filler} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-700 font-mono">{filler}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(filler)}
                  className="text-xs text-slate-300 hover:text-red-500 transition-colors px-2 py-1 rounded"
                >
                  삭제
                </button>
              </li>
            ))}
            {fillers.length === 0 && (
              <li className="px-4 py-6 text-xs text-slate-300 text-center">
                필터 단어가 없습니다.
              </li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
