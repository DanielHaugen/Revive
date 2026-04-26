import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens — map to CSS variables in globals.css :root
        // Changing a variable there updates the whole app.
        background: 'var(--background)',
        foreground: 'var(--text-primary)',
        surface: 'var(--surface)',
        elevated: 'var(--surface-elevated)',
        field: 'var(--input-bg)',
        muted: 'var(--text-secondary)',
        subtle: 'var(--text-placeholder)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          hover: 'var(--color-success-hover)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          hover: 'var(--color-danger-hover)',
        },
        warning: 'var(--color-warning)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;
