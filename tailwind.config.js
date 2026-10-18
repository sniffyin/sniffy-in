/** @type {import('tailwindcss').Config} */
export default {
  // `scripts/` emits real HTML (the prerendered SPA shell and all 58 generated
  // locality pages), so any Tailwind class used only there must be scanned too —
  // otherwise it is purged and the static frame ships unstyled. This bit
  // `list-inside` / `marker:text-sniffy-yellow` in the prerendered story blocks.
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './scripts/**/*.{js,ts}'],
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
