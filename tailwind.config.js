/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-primary': '#297378',
        white: '#FFF',
        'light-bg': '#ECF2EF',
        'dark-bg': '#d5e2e1',
        'custom-secondary-dark': '#103b4d',
      },
      borderRadius: {
        medium: '16px',
      },
      spacing: {
        s: '16px',
        m: '24px',
      },
      fontSize: {
        small: ['16px', '1.4'], // Font size та line-height
      },
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

