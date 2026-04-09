/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4a8fe3',
          50:  '#eef5fd',
          100: '#d6e9fb',
          200: '#b0d2f6',
          300: '#7eb5ef',
          400: '#5599e8',
          500: '#4a8fe3',
          600: '#2b6ec7',
          700: '#2358a3',
          800: '#1e4887',
          900: '#1a3c6f',
        },
        accent: '#22d3a0',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
