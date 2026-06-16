/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        bg: {
          base: '#0b0f1a',
          surface: '#111827',
          raised: '#1a2236',
          hover: '#1e2844',
        },
        border: {
          subtle: '#1e2d47',
          DEFAULT: '#253a5a',
          strong: '#2e4a72',
        },
        accent: {
          DEFAULT: '#00e5cc',
          dim: 'rgba(0,229,204,0.15)',
          hover: '#33edd6',
        },
        success: '#10b981',
        danger: '#f43f5e',
        warning: '#f59e0b',
        muted: '#64748b',
        subtle: '#94a3b8',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
