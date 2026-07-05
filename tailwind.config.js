/** ShreyFPV Productions — Tailwind build config (v3) */
module.exports = {
  content: ["./site/*.html"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Bebas Neue", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      colors: {
        electric: { DEFAULT: "#00c6ff", dark: "#0072ff", glow: "#00c6ff33" },
        slate: { 950: "#060b18" },
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
