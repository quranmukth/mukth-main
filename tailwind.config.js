/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#011a12',
          850: '#022c22',
          800: '#064e3b',
          700: '#065f46',
          600: '#047857',
          500: '#059669',
          200: '#a7f3d0',
          100: '#d1fae5',
          50:  '#ecfdf5',
        },
        gold: {
          DEFAULT: '#d4af37',
          dark:    '#b8941f',
          light:   '#f0dc80',
          50:      '#fffbea',
        },
        offwhite: '#fafaf8',
        muted:    '#4a6358',
      },
      fontFamily: {
        arabic:  ['Tajawal', 'IBM Plex Sans Arabic', 'sans-serif'],
        display: ['IBM Plex Sans Arabic', 'Tajawal', 'sans-serif'],
        quran:   ['Amiri', 'serif'],
      },
      animation: {
        'fade-up':   'fadeUp 0.7s ease both',
        'fade-in':   'fadeIn 0.4s ease both',
        'pulse-ring':'pulseRing 2.2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeUp:    { from: { opacity:'0', transform:'translateY(28px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        fadeIn:    { from: { opacity:'0' }, to: { opacity:'1' } },
        pulseRing: { '0%':{ transform:'scale(1)', opacity:'0.5' }, '100%':{ transform:'scale(1.9)', opacity:'0' } },
      },
    },
  },
  plugins: [],
}
