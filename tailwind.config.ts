import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        trust: {
          navy: "#0F172A",
          dark: "#020617",
          accent: "#14B8A6",
          gold: "#D97706",
          light: "#F1F5F9",
        },
      },
    },
  },
  plugins: [],
};
export default config;
