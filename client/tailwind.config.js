/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f8fafc",
          border: "#e2e8f0",
        },
        ink: {
          DEFAULT: "#0f172a",
          muted: "#475569",
          subtle: "#64748b",
        },
        accent: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
        },
      },
      boxShadow: {
        panel: "0 4px 24px -4px rgba(15, 23, 42, 0.12), 0 2px 8px -2px rgba(15, 23, 42, 0.06)",
        "panel-lg": "0 12px 40px -8px rgba(15, 23, 42, 0.18), 0 4px 12px -4px rgba(15, 23, 42, 0.08)",
        float: "0 8px 30px -6px rgba(99, 102, 241, 0.25)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Nunito Sans", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
