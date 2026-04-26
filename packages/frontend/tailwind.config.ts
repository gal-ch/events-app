import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './app/**/*.{ts,tsx}', './main.tsx'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
