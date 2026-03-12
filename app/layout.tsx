import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "AI Router — 한국어 프롬프트 컴파일러",
  description: "Local prompt compiler for Korean Claude users",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 min-h-screen antialiased">{children}</body>
    </html>
  );
}
