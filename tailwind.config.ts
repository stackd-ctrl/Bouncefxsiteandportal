import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        party: {
          // Core editorial palette — flat, bold color blocks
          yellow: "#F9D84B",
          red: "#DC4327",
          ink: "#191919",
          cream: "#FFF6E0",
          // Secondary accents (logo-derived) used sparingly
          blue: "#2A6FDB",
          green: "#3AA84A",
          pink: "#E85B81",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(25,25,25,0.25)",
        card: "0 18px 40px -20px rgba(25,25,25,0.35)",
        // Legacy aliases — softened so existing usages stay on-brand
        "pop-sm": "0 4px 12px -6px rgba(25,25,25,0.3)",
        pop: "0 10px 30px -12px rgba(25,25,25,0.25)",
        "pop-lg": "0 18px 40px -20px rgba(25,25,25,0.35)",
        "pop-xl": "0 24px 50px -24px rgba(25,25,25,0.4)",
      },
      borderWidth: {
        3: "3px",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-rev": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(-3deg)" },
          "50%": { transform: "translateY(-14px) rotate(3deg)" },
        },
        "float-mid": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "translateY(22px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        "marquee-fast": "marquee 18s linear infinite",
        "marquee-rev": "marquee-rev 30s linear infinite",
        "float-slow": "float-slow 7s ease-in-out infinite",
        "float-mid": "float-mid 5s ease-in-out infinite",
        "pop-in": "pop-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
