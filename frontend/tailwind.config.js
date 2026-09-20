/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070A0F',
          900: '#0B0F17',
          850: '#0F1520',
          800: '#141C2B',
          700: '#1E293B',
          600: '#334155',
        },
        brand: {
          coral: '#FF5A36',
          'coral-hover': '#F04722',
          amber: '#F59E0B',
          mint: '#10B981',
          teal: '#06D6A0',
          indigo: '#6366F1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-coral': '0 0 30px -5px rgba(255, 90, 54, 0.3)',
        'glow-mint': '0 0 30px -5px rgba(16, 185, 129, 0.3)',
      }
    },
  },
  plugins: [],
}
