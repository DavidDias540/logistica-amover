/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#d6d6d6',
        header: '#333333',
        button: '#7D7D7D',
      },
    },
  },
  plugins: [],
};