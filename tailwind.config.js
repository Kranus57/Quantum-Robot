/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./frontend/index.html",
    "./frontend/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        quantum: {
          bg: "#FFFFFF",         // Pure Crisp White Background
          panel: "#FFFFFF",      // Pure White Panel
          border: "#E2E8F0",     // Slate 200 Border
          card: "#FFFFFF",       // White Card
          navy: "#0F172A",       // Slate 900 Navy
          blue: "#0284C7",       // Sky 600
          indigo: "#4F46E5",     // Indigo 600
          purple: "#7C3AED",     // Purple 600
          emerald: "#059669",    // Emerald 600
          amber: "#D97706",      // Amber 600
          rose: "#E11D48",       // Rose 600
          dark: "#090D16",       // Deep Executive Dark
        },
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'enterprise': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)',
        'enterprise-md': '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)',
        'enterprise-lg': '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.05)',
        'cyan-glow': '0 4px 12px 0 rgba(2, 132, 199, 0.2)',
        'indigo-glow': '0 4px 12px 0 rgba(79, 70, 229, 0.2)',
      },
    },
  },
  plugins: [],
};
