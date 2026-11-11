/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#070B14',
        'secondary-bg': '#0B132B',
        'card-bg': '#111C30',
        'surface-bg': '#18243A',
        'emerald': '#10B981',
        'emerald-dark': '#059669',
        'cyan': '#06B6D4',
        'primary-text': '#F8FAFC',
        'secondary-text': '#94A3B8',
        'border': 'rgba(255,255,255,0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
