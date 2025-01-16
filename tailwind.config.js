/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-primary': 'var(--custom-primary)',
        'light-bg': 'var(--light-bg)',
        'dark-bg': 'var(--dark-bg)',
        'custom-secondary-dark': 'var(--custom-secondary-dark)',
        'custom-accent-3': 'var(--custom-accent-3)',
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

