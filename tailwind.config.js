/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
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
      fontFamily: {
        display: ['var(--font-display)', 'Fraunces', 'Playfair Display', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh': 'radial-gradient(at 20% 20%, rgba(255,146,183,0.35) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(255,109,159,0.28) 0px, transparent 45%), radial-gradient(at 60% 90%, rgba(244,114,182,0.25) 0px, transparent 50%)',
        'aurora': 'linear-gradient(120deg, #ffe4ee 0%, #fff0f6 30%, #ffe1ec 60%, #ffd6e6 100%)',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
        'marquee-slow': 'marquee 60s linear infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'accordion-down': 'accordion-down 0.25s ease-out',
        'accordion-up': 'accordion-up 0.25s ease-out',
        'gradient-x': 'gradient-x 6s ease infinite',
        'orbit': 'orbit 12s linear infinite',
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
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,109,159,0.5)' },
          '50%': { boxShadow: '0 0 0 12px rgba(255,109,159,0)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(30px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(30px) rotate(-360deg)' },
        },
      },
      boxShadow: {
        'soft': '0 3px 10px rgba(0, 0, 0, 0.05)',
        'card': '0 5px 15px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'glow': '0 20px 60px -20px rgba(255,109,159,0.45)',
        'glow-lg': '0 30px 80px -20px rgba(255,109,159,0.55)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
  corePlugins: {
    opacity: true,
  },
}
