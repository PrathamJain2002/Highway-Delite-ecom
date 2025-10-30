import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFD643',
          black: '#111111',
          gray: '#F2F2F2'
        }
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.06), 0 4px 10px rgba(0,0,0,0.04)'
      },
      borderRadius: {
        xl: '14px'
      }
    }
  },
  plugins: []
} satisfies Config


