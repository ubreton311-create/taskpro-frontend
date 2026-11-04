/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-purple': '#9400D3',
        'brand-purple-dark': '#6B0097',
        'brand-purple-light': '#B84BE6',
        'brand-yellow': '#FFD43B',
        'brand-dark': '#102C53',
      },
    },
  },
  plugins: [],
}