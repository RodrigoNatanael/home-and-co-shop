/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        sans: ['Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#000000',     // Black for accents/text
          gray: '#333333',     // Dark gray
          light: '#F5F5F5',    // Smoke white bg
          accent: '#A0A0A0',   // Industrial metal
        }
      },
      borderRadius: {
        'clean': '0px',       // Sharp edges prefered
        'sm': '2px',
      }
    },
  },
  plugins: [],
}
