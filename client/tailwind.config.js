/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: '#0a0a0a',
          card: '#1a1a1a',
          border: '#2a2a2a',
          red: '#dc2626',
          'red-hover': '#b91c1c',
          text: '#f5f5f5',
          'text-muted': '#a3a3a3',
          accent: '#fbbf24',
        }
      },
      fontFamily: {
        'mono': ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
