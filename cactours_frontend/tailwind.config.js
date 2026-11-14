/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mineral: 'var(--color-mineral-ivory)',
        cactours: 'var(--color-turquesa-cactours)',
        petrol: 'var(--color-azul-petroleo)',
        lagoon: 'var(--color-azul-brillante)',
        carbon: 'var(--color-carbon)',
      },
      fontFamily: {
        sans: ['var(--font-body)'],
        heading: ['var(--font-heading)'],
        editorial: ['var(--font-editorial)'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
      },
      borderRadius: {
        card: 'var(--radius-md)',
      },
    },
  },
  plugins: [],
}
