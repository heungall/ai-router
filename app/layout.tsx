import type { Metadata } from "next";
import type { ReactNode } from "react";
import ThemeProvider from "@/components/ThemeProvider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "AI Router — 한국어 프롬프트 컴파일러",
  description: "Local prompt compiler for Korean Claude users",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-900 min-h-screen antialiased transition-colors">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
