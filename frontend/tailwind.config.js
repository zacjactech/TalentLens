/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
      extend: {
          colors: {
              "primary": "#0f1729",
              "accent": "#4f46e5",
              "success": "#10b981",
              "background-light": "#f8fafc",
              "background-dark": "#14171e",
              "slate-card": "#ffffff",
          },
          fontFamily: {
              "display": ["Inter", "sans-serif"]
          },
          borderRadius: {
            "DEFAULT": "0.25rem", 
            "lg": "0.5rem", 
            "xl": "0.75rem", 
            "full": "9999px"
          },
      },
  },
  plugins: [],
}
