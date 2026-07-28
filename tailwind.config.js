/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',
          slate: '#1e293b',
          navy: '#0f2338',
          accent: '#0284c7',
          emergency: '#dc2626',
          amber: '#d97706',
          green: '#16a34a',
          sky: '#38bdf8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
