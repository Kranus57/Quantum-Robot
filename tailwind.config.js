/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        quantum: {
          bg: "#F8FAFC",       // Slate 50 Light Background
          panel: "#FFFFFF",    // Pure White Panel
          border: "#E2E8F0",   // Slate 200 Border
          card: "#FFFFFF",     // White Card
          cyan: "#0284C7",     // Sky 600
          magenta: "#6366F1",  // Indigo 500
          violet: "#4F46E5",   // Indigo 600
          emerald: "#059669",  // Emerald 600
          amber: "#D97706",    // Amber 600
          dark: "#F1F5F9",     // Slate 100
        },
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 4px 12px 0 rgba(2, 132, 199, 0.15)',
        'magenta-glow': '0 4px 12px 0 rgba(99, 102, 241, 0.15)',
        'violet-glow': '0 4px 12px 0 rgba(79, 70, 229, 0.15)',
      },
    },
  },
  plugins: [],
};
