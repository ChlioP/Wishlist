import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pink: "#F8AFC8",
        blush: "#FCE7EF",
        cream: "#FFF8F0",
        lavender: "#D8C7FF",
        ink: "#3A2E39",
        muted: "#9A8A96",
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        sans: ["Inter", "sans-serif"],
      },
      borderColor: {
        soft: "rgb(248 175 200 / 0.35)",
      },
      boxShadow: {
        soft: "0 20px 60px rgb(58 46 57 / 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
