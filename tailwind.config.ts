import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#020617",
          50: "#0f172a",
          100: "#1e293b",
          200: "#334155",
          300: "#475569",
          400: "#64748b",
          500: "#94a3b8",
        },
        indigo: {
          DEFAULT: "#6366f1",
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        accent: {
          cyan: "#22d3ee",
          purple: "#a78bfa",
          rose: "#fb7185",
          amber: "#fbbf24",
        },
      },
      fontFamily: {
        vazir: ["var(--font-vazirmatn)", "sans-serif"],
      },
      maxWidth: {
        content: "80rem",
      },
      animation: {
        "breathe-in": "breatheIn 4s ease-in-out",
        "breathe-hold": "breatheHold 7s ease-in-out",
        "breathe-out": "breatheOut 8s ease-in-out",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-gentle": "pulseGentle 3s ease-in-out infinite",
      },
      keyframes: {
        breatheIn: {
          "0%": { transform: "scale(1)", opacity: "0.4" },
          "100%": { transform: "scale(1.3)", opacity: "0.9" },
        },
        breatheHold: {
          "0%, 100%": { transform: "scale(1.3)", opacity: "0.9" },
        },
        breatheOut: {
          "0%": { transform: "scale(1.3)", opacity: "0.9" },
          "100%": { transform: "scale(1)", opacity: "0.4" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(99, 102, 241, 0.6)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGentle: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
