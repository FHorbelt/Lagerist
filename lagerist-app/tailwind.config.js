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
        accent: {
          DEFAULT: 'rgb(193, 218, 81)',
          50: 'rgb(243, 248, 226)',
          100: 'rgb(235, 243, 204)',
          200: 'rgb(224, 236, 167)',
          300: 'rgb(208, 229, 124)',
          400: 'rgb(201, 224, 103)',
          500: 'rgb(193, 218, 81)',
          600: 'rgb(174, 196, 73)',
          700: 'rgb(145, 164, 61)',
          800: 'rgb(116, 131, 49)',
          900: 'rgb(87, 98, 37)',
        }
      }
    },
  },
  plugins: [],
}
