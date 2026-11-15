/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F7F8F2',
        surface: '#FFFFFF',
        primary: '#245B3C',
        'primary-light': '#E8F0E9',
        secondary: '#829B77',
        earth: '#A66B45',
        charcoal: '#202B24',
        muted: '#748077',
        border: '#E2E8E0',
        warning: '#C58A27',
        danger: '#B94A48'
      }
    }
  },
  plugins: []
};
