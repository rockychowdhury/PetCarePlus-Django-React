/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Unified Semantic Color System
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          surface: 'var(--color-bg-surface)',
          overlay: 'var(--color-bg-overlay)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          inverted: 'var(--color-text-inverted)',
          muted: 'var(--color-text-muted)',
        },
        brand: {
          primary: 'var(--color-brand-primary)',
          secondary: 'var(--color-brand-secondary)',
          accent: 'var(--color-brand-accent)',
          ai: 'var(--color-brand-ai)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          light: 'var(--color-border-light)',
          focus: 'var(--color-border-focus)',
          error: 'var(--color-border-error)',
        },
        status: {
          success: 'var(--color-status-success)',
          error: 'var(--color-status-error)',
          warning: 'var(--color-status-warning)',
          info: 'var(--color-status-info)',
        },
        themev2: {
          bg: 'var(--themev2-bg)',
          surface: 'var(--themev2-surface)',
          primary: 'var(--themev2-primary)',
          text: 'var(--themev2-text)',
        },

      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        logo: ['"Concert One"', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',    // 12px
        '2xl': '1rem',      // 16px
        '3xl': '1.5rem',    // 24px
      },
      screens: {
        xs: '480px',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}