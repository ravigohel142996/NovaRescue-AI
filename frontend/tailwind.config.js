/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nova: {
          bg: "#0A0A0F",
          panel: "#0F1117",
          border: "#1E2030",
          accent: "#CC0000",
          "accent-dark": "#990000",
          "accent-glow": "#FF0000",
          text: "#E2E8F0",
          muted: "#94A3B8",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
          info: "#3B82F6",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-red": "pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in": "slide-in 0.3s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "scan": "scan 3s linear infinite",
        "blink": "blink 1s step-end infinite",
      },
      keyframes: {
        "pulse-red": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.3 },
        },
        "slide-in": {
          from: { transform: "translateX(-20px)", opacity: 0 },
          to: { transform: "translateX(0)", opacity: 1 },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        blink: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0 },
        },
      },
      boxShadow: {
        "nova-glow": "0 0 20px rgba(204, 0, 0, 0.3)",
        "nova-panel": "0 4px 24px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [],
};
