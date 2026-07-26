/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef1fd',
          100: '#dde3fb',
          200: '#b9c4f6',
          300: '#94a5f1',
          400: '#6f86ec',
          500: '#4f67e0',
          600: '#3d52c4',
          700: '#333f9c',
          800: '#2a3378',
          900: '#232a5e',
        },
      },
      borderRadius: {
        clay: '20px',
      },
      boxShadow: {
        clay: 'var(--shadow-clay)',
        'clay-active': 'var(--shadow-clay-active)',
        'clay-inset': 'var(--shadow-clay-inset)',
        'clay-button': '0 10px 24px -8px rgba(61, 82, 196, 0.45)',
        glass: 'var(--shadow-glass)',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
