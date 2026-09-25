/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0C',
        'champagne-gold': '#D4AF37',
        'dark-bg': '#0C0C0E',
        'dark-surface': '#141416',
        'dark-card': '#18181C',
        'dark-border': '#232328',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
