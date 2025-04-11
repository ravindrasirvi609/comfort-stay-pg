/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-pink-50',
    'bg-pink-100',
    'bg-pink-200',
    'bg-pink-300',
    'bg-pink-400',
    'bg-pink-500',
    'bg-pink-600',
    'hover:bg-pink-600',
    'hover:bg-pink-700',
    'text-pink-300',
    'text-pink-400',
    'text-pink-500',
    'text-pink-600',
    'dark:text-pink-300',
    'dark:text-pink-400',
    'text-white',
    'dark:bg-pink-900/20',
    'dark:bg-pink-900/30',
    'glass-effect'
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#FFF9FC',
          100: '#FFEEF5',
          200: '#FFD6E6',
          300: '#FFB7CC',
          400: '#FF92B7',
          500: '#FF6D9F',
          600: '#FF4D90',
          700: '#FF1F73',
          800: '#DF0058',
          900: '#AA0049',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
      },
      boxShadow: {
        'soft': '0 3px 10px rgba(0, 0, 0, 0.05)',
        'card': '0 5px 15px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    opacity: true,
  },
} 