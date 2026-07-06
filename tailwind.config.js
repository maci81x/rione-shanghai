/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        shanghai: {
          yellow: '#FFED00',
          black: '#000000',
          bg: '#f5f5f5',
          card: '#ffffff',
          border: '#eeeeee',
        },
      },
    },
  },
  plugins: [],
}

