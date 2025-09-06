/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: '#F5F4E8',
        ink: '#2D1810',
        brown: '#8B4513',
        gold: '#D4AF37',
      },
      fontFamily: {
        'header': ['Germania One', 'serif'],
        'body': ['PT Sans Narrow', 'sans-serif'],
        'condensed': ['PT Sans Narrow', 'sans-serif'],
      }
    },
  },
  plugins: [],
}