/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: token('surface'),
        panel: token('panel'),
        sunken: token('sunken'),
        line: token('line'),
        ink: token('ink'),
        muted: token('muted'),
        brand: token('brand'),
        'brand-soft': token('brand-soft'),
        'on-brand': token('on-brand'),
        accent: token('accent'),
        pass: token('pass'),
        fail: token('fail'),
        warn: token('warn'),
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        serif: ['"IBM Plex Serif"', 'Georgia', 'serif'],
      },
      keyframes: {
        sheetIn: { from: { transform: 'translateY(24px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        caret: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
      },
      animation: {
        'sheet-in': 'sheetIn 220ms ease-out',
        caret: 'caret 1s steps(1) infinite',
      },
    },
  },
  plugins: [],
};
