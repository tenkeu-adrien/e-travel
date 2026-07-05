import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: { DEFAULT: "#1DB954", light: "#D4F4E2", dark: "#159c44" },
        navy: { DEFAULT: "#0A1628", light: "#1a2942" },
        orange: "#FF6B35",
        bg: "#F8F9FA",
        greyLight: "#E8ECEF",
        greyMid: "#8C9BAB",
        greyDark: "#3D4B5C",
        red: "#FF4757",
        yellow: "#FFC300",
      },
      borderRadius: {
        card: "12px",
        sm2: "8px",
      },
      boxShadow: {
        card: "0 2px 16px rgba(0,0,0,0.08)",
        cardLg: "0 8px 32px rgba(0,0,0,0.12)",
      },
      fontFamily: {
        sans: ["Segoe UI", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
