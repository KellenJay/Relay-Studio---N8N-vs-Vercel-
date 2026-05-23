import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        loopin: {
          bg: '#0F0F1A',
          card: '#1A1A2E',
          border: '#2A2A45',
          purple: '#5B4AE8',
          'purple-hover': '#4A3BD4',
          'purple-light': 'rgba(91,74,232,0.15)',
          teal: '#00D9C8',
          'teal-hover': '#00C4B5',
          orange: '#FF5A1F',
          muted: '#6B7280',
          text: '#F9FAFB',
          'text-secondary': '#9CA3AF',
        },
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}
export default config
