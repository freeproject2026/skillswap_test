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
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#1e3a5f',
          900: '#0f2744',
          950: '#09182b',
        },
        brand: {
          dark: '#0a1128',
          navy: '#0e1e38',
          slate: '#1b2d4f',
          teal: '#0d9488',
          tealLight: '#14b8a6',
          tealGlow: '#2dd4bf',
          amber: '#f59e0b',
          purple: '#8b5cf6',
          coral: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -2px rgba(14, 30, 56, 0.08)',
        'float': '0 10px 25px -5px rgba(13, 148, 136, 0.25)',
      }
    },
  },
  plugins: [],
}
