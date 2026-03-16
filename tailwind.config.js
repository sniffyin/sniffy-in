/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'sniffy-purple': '#451a8b',
        'sniffy-yellow': '#f6ac0a',
      },
    },
  },
  plugins: [],
};
