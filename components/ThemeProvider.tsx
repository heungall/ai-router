"use client";

import { useState, useEffect, createContext, useContext } from "react";
import type { ReactNode } from "react";

type Theme = "system" | "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
}>({ theme: "system", setTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    const saved = localStorage.getItem("ai-router-theme") as Theme | null;
    if (saved) setThemeState(saved);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    function apply() {
      if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }

    apply();

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem("ai-router-theme", t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
