/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3f8ff', 100: '#e6f0ff', 200: '#c7ddff', 300: '#a3c6ff', 400: '#76a6ff', 500: '#4a87ff', 600: '#2f6cf0', 700: '#2656c7', 800: '#2349a4', 900: '#1f3f87'
        }
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.06)'
      }
    },
  },
  plugins: [],
}

