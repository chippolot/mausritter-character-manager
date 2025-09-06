/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors (keeping for backward compatibility)
        parchment: '#F5F4E8',
        ink: '#2D1810',
        brown: '#8B4513',
        gold: '#D4AF37',
        
        // Theme colors using CSS custom properties
        theme: {
          primary: {
            50: 'var(--theme-primary-50)',
            100: 'var(--theme-primary-100)',
            200: 'var(--theme-primary-200)',
            300: 'var(--theme-primary-300)',
            400: 'var(--theme-primary-400)',
            500: 'var(--theme-primary-500)',
            600: 'var(--theme-primary-600)',
            700: 'var(--theme-primary-700)',
            800: 'var(--theme-primary-800)',
            900: 'var(--theme-primary-900)',
          },
          neutral: {
            50: 'var(--theme-neutral-50)',
            100: 'var(--theme-neutral-100)',
            200: 'var(--theme-neutral-200)',
            300: 'var(--theme-neutral-300)',
            400: 'var(--theme-neutral-400)',
            500: 'var(--theme-neutral-500)',
            600: 'var(--theme-neutral-600)',
            700: 'var(--theme-neutral-700)',
            800: 'var(--theme-neutral-800)',
            900: 'var(--theme-neutral-900)',
          },
          success: {
            100: 'var(--theme-success-100)',
            800: 'var(--theme-success-800)',
          },
          warning: {
            100: 'var(--theme-warning-100)',
            800: 'var(--theme-warning-800)',
          },
          error: {
            100: 'var(--theme-error-100)',
            600: 'var(--theme-error-600)',
            800: 'var(--theme-error-800)',
          },
          info: {
            100: 'var(--theme-info-100)',
            800: 'var(--theme-info-800)',
          },
          magic: {
            100: 'var(--theme-magic-100)',
            800: 'var(--theme-magic-800)',
          },
          currency: {
            100: 'var(--theme-currency-100)',
            800: 'var(--theme-currency-800)',
          },
          surface: 'var(--theme-surface)',
          background: 'var(--theme-background)',
          text: 'var(--theme-text)',
          'text-light': 'var(--theme-text-light)',
        },
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