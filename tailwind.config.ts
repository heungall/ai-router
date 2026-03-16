import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        progress: "progress 1.5s ease-in-out infinite",
      },
      keyframes: {
        progress: {
          "0%": { width: "0%", marginLeft: "0%" },
          "50%": { width: "60%", marginLeft: "20%" },
          "100%": { width: "0%", marginLeft: "100%" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
