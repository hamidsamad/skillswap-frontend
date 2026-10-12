/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '375px',
      },
      colors: {
        pk: {
          bg: '#FAF9F5',
          card: '#FFFFFF',
          navy: '#102B50',
          navySecondary: '#183A60',
          emerald: '#07866D',
          emeraldDeep: '#086B57',
          mint: '#EAF6EF',
          greenSurface: '#F1F8F2',
          blueSurface: '#EEF6FC',
          text: '#24364B',
          textMuted: '#708096',
          border: '#E5EAE7',
          success: '#16855F',
          warning: '#E7A62C',
          danger: '#DC5555',
        },
        navy: {
          DEFAULT: '#102B50',
          dark: '#060B18',
          light: '#183A60',
          border: '#E5EAE7',
        },
        brand: {
          navy: '#102B50',
          sky: '#0284C7',
          skyLight: '#38BDF8',
          emerald: '#07866D',
          emeraldLight: '#16855F',
          teal: '#086B57',
          slate: '#24364B',
          dark: '#080B14',
          surface: '#0E1424',
          card: '#FFFFFF',
          cardBorder: '#E5EAE7',
          cardLight: '#FFFFFF',
          warm: '#FAF9F5',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'glow-sky': '0 0 30px -5px rgba(2, 132, 199, 0.35)',
        'glow-emerald': '0 0 30px -5px rgba(16, 185, 129, 0.35)',
        'glow-teal': '0 0 30px -5px rgba(13, 148, 136, 0.35)',
        'glow-card': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 20px 40px -15px rgba(2, 132, 199, 0.15)',
        'inner-glow': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
