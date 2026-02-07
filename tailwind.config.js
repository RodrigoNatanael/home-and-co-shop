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
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
