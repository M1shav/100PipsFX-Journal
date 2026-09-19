/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        app: '#000000',
        surface: '#050505',
        surface2: '#0A0A0A',
        border: '#1C1C1C',
        brand: '#0A84FF',
        profit: '#0A84FF',
        loss: '#FF453A',
        textMain: '#F5F5F7',
        muted: '#8E8E93'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
      }
    },
  },
  plugins: [],
}
