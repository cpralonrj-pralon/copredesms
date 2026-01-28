/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        claro: {
          red: '#ef0000',
        },
        app: {
          main: 'rgb(var(--bg-main) / <alpha-value>)',
          sidebar: 'rgb(var(--bg-sidebar) / <alpha-value>)',
          card: 'rgb(var(--bg-card) / <alpha-value>)',
          primary: 'rgb(var(--primary) / <alpha-value>)',
          'primary-foreground': 'rgb(var(--primary-foreground) / <alpha-value>)',
          'text-main': 'rgb(var(--text-main) / <alpha-value>)',
          'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
          'sidebar-text': 'rgb(var(--sb-text) / <alpha-value>)',
          'sidebar-text-secondary': 'rgb(var(--sb-text-secondary) / <alpha-value>)',
          border: 'rgb(var(--border) / <alpha-value>)',
          'border-light': 'rgb(var(--border-light) / <alpha-value>)',
        }
      }
    },
  },
  plugins: [],
}
