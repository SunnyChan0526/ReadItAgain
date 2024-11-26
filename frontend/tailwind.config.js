/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors:{
        'tan': {
          '50': '#faf7f2',
          '100': '#f2ede2',
          '200': '#e5d9c3',
          '300': '#d4c09d',
          '400': '#c8ab83',
          '500': '#b58b5a',
          '600': '#a8794e',
          '700': '#8c6242',
          '800': '#714f3b',
          '900': '#5c4232',
          '950': '#312119',
        },
        'coupon':{
          '200':'#FAFAF5',
          '700':'E6E6E6',
        },      
      },
      fontFamily:{
        'logofont':['Darumadrop One','sans-serif'],
        'newsfont':['Noto Serif TC','serif'],
      },
    },
  },
  plugins: [],
}

