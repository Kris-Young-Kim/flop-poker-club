import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", ".dark"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0B0B0F", // Matte Black
          surface: "#13141C", // Charcoal Surface
          elevated: "#181A26", // Elevated Card Surface
        },
        gold: {
          50: "#FDF9E7",
          100: "#FBF3CE",
          200: "#F7E69D",
          300: "#F5D061", // Gold Light
          400: "#E6AF2E", // Gold Primary
          500: "#C28B1E", // Gold Dark
          600: "#9C6B14",
          700: "#754C0D",
          800: "#4D3008",
          900: "#2B1903",
          DEFAULT: "#E6AF2E",
          champagne: "#F3E5AB", // Champagne Subtext
        },
        casino: {
          matte: "#0B0B0F",
          charcoal: "#13141C",
          surface: "#181A26",
          gold: "#E6AF2E",
          champagne: "#F3E5AB",
          muted: "#9CA3AF",
          border: "rgba(230, 175, 46, 0.25)",
          glow: "rgba(245, 208, 97, 0.15)",
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #F5D061 0%, #E6AF2E 50%, #C28B1E 100%)",
        "gold-metallic": "linear-gradient(135deg, #FFF0A5 0%, #F5D061 25%, #E6AF2E 50%, #8C5D0E 75%, #F5D061 100%)",
        "card-dark-gradient": "linear-gradient(145deg, #181A26 0%, #13141C 100%)",
        "vip-royal-gradient": "linear-gradient(135deg, #241a06 0%, #17130b 50%, #0d0c0a 100%)",
      },
      boxShadow: {
        "gold-glow": "0 0 25px -5px rgba(245, 208, 97, 0.25)",
        "gold-glow-lg": "0 0 40px -5px rgba(245, 208, 97, 0.35)",
        "card-luxury": "0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(230, 175, 46, 0.2)",
      },
      animation: {
        "shimmer-gold": "shimmer 3s ease-in-out infinite",
        "pulse-subtle": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { opacity: "0.8" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
