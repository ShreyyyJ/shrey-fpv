/** ShreyFPV Productions — Tailwind build config (v3) */
module.exports = {
  future: { hoverOnlyWhenSupported: true },
  content: ["./site/*.html"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Bebas Neue", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      colors: {
        electric: { DEFAULT: "#00c6ff", dark: "#0072ff", glow: "#00c6ff33" },
        // Cinema Black system: neutral zinc greys mapped onto the slate utilities
        slate: {
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          950: "#0a0a0b",
        },
      },
      backgroundImage: {
        "electric-grad": "linear-gradient(135deg, #0072ff 0%, #00c6ff 100%)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(32px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: { fadeUp: "fadeUp 0.8s ease forwards" },
    },
  },
  plugins: [],
};
