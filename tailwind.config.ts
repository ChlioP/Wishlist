import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#F8AFC8",
          dark: "#A0547A",
        },
        blush: "#FCE7EF",
        cream: "#FFF8F0",
        lavender: "#D8C7FF",
        ink: "#3A2E39",
        muted: "#756A73",
        surface: "#FFFFFF",
        success: {
          DEFAULT: "#EAF7F0",
          foreground: "#2A7A52",
        },
        purple: {
          DEFAULT: "#EDE8FF",
          foreground: "#6B52C0",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        sans: ["Inter", "sans-serif"],
      },
      borderColor: {
        soft: "rgb(248 175 200 / 0.35)",
      },
      borderRadius: {
        card: "1.125rem",
      },
      boxShadow: {
        soft: "0 20px 60px rgb(58 46 57 / 0.08)",
        card: "0 12px 32px rgb(58 46 57 / 0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;
