/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        mc: {
          bg: '#1a1a1a',
          grass: '#4a7c59',
          dirt: '#8b6914',
          stone: '#7a7a7a',
          diamond: '#4dd9e0',
          gold: '#FFD700',
          redstone: '#cc1111',
          verified: '#5aaf2a',
          uncertain: '#e5a100',
          panel: '#2a2a2a',
          emerald: '#17dd62',
          obsidian: '#12111c',
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        sans: ['system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'pixel-grid': 'linear-gradient(to right, #252525 1px, transparent 1px), linear-gradient(to bottom, #252525 1px, transparent 1px)',
        'grass-top': 'linear-gradient(to bottom, #4a7c59 0%, #4a7c59 30%, #8b6914 30%, #8b6914 100%)',
      },
      backgroundSize: {
        'pixel': '32px 32px',
        'pixel-sm': '16px 16px',
      },
      animation: {
        'mine': 'mine 0.4s infinite alternate ease-in-out',
        'bounce-block': 'bounce-block 0.6s ease-out',
        'bounce-idle': 'bounce-idle 3s infinite ease-in-out',
        'fill-xp': 'fill-xp 1.2s ease-out forwards',
        'fill-hearts': 'fill-hearts 1s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'slide-in': 'slide-in 0.3s ease-out forwards',
        'firework-1': 'firework-1 1.2s ease-out forwards',
        'firework-2': 'firework-2 1.4s ease-out 0.2s forwards',
        'firework-3': 'firework-3 1.2s ease-out 0.4s forwards',
        'pulse-red': 'pulse-red 1s infinite',
        'flicker': 'flicker 0.15s infinite',
        'float': 'float 4s ease-in-out infinite',
        'spin-slow': 'spin 6s linear infinite',
        'death-screen': 'death-screen 0.3s ease-out forwards',
        'winner-banner': 'winner-banner 0.5s ease-out forwards',
        'particle': 'particle 8s linear infinite',
        'shake': 'shake 0.4s ease-out',
      },
      keyframes: {
        mine: {
          '0%': { transform: 'rotate(0deg) translateY(0)', transformOrigin: 'bottom right' },
          '100%': { transform: 'rotate(-50deg) translateY(-2px)', transformOrigin: 'bottom right' },
        },
        'bounce-block': {
          '0%': { transform: 'translateY(0) scale(1)' },
          '30%': { transform: 'translateY(-12px) scale(1.05)' },
          '60%': { transform: 'translateY(-4px) scale(1)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        'bounce-idle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'fill-xp': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--target-width, 100%)' },
        },
        'fill-hearts': {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '60%': { transform: 'scale(1.2)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'firework-1': {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'scale(1.5) rotate(180deg)', opacity: '1' },
          '100%': { transform: 'scale(0.5) rotate(360deg)', opacity: '0' },
        },
        'firework-2': {
          '0%': { transform: 'scale(0) translateY(0)', opacity: '1' },
          '50%': { transform: 'scale(2) translateY(-20px)', opacity: '1' },
          '100%': { transform: 'scale(0) translateY(-40px)', opacity: '0' },
        },
        'firework-3': {
          '0%': { transform: 'scale(0) rotate(45deg)', opacity: '1' },
          '60%': { transform: 'scale(1.8) rotate(225deg)', opacity: '1' },
          '100%': { transform: 'scale(0.2) rotate(405deg)', opacity: '0' },
        },
        'pulse-red': {
          '0%, 100%': { backgroundColor: '#cc1111' },
          '50%': { backgroundColor: '#ff2222' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-15px) rotate(5deg)' },
          '66%': { transform: 'translateY(-8px) rotate(-3deg)' },
        },
        'death-screen': {
          '0%': { opacity: '0', transform: 'scale(1.1)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'winner-banner': {
          '0%': { opacity: '0', transform: 'translateY(-20px) scale(0.9)' },
          '60%': { transform: 'translateY(4px) scale(1.02)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'particle': {
          '0%': { transform: 'translateY(100vh) translateX(0) rotate(0deg)', opacity: '0.6' },
          '25%': { transform: 'translateY(75vh) translateX(20px) rotate(90deg)' },
          '50%': { transform: 'translateY(50vh) translateX(-10px) rotate(180deg)' },
          '75%': { transform: 'translateY(25vh) translateX(15px) rotate(270deg)' },
          '100%': { transform: 'translateY(-10vh) translateX(0) rotate(360deg)', opacity: '0' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
      }
    }
  },
  plugins: [],
};
