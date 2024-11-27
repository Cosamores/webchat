/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',   // Blue 600
        secondary: '#10b981', // Emerald 500
        accent: '#fbbf24',    // Amber 400
        neutral: '#374151',   // Gray 700
        base: '#f3f4f6',      // Gray 100
        dark: '#111827',      // Gray 900
      },
      fontSize: {
        xs: ['0.75rem', '1rem'],   // 12px
        sm: ['0.875rem', '1.25rem'], // 14px
        base: ['1rem', '1.5rem'],    // 16px
        lg: ['1.125rem', '1.75rem'], // 18px
        xl: ['1.25rem', '1.75rem'],  // 20px
        '2xl': ['1.5rem', '2rem'],   // 24px
      },
    },
  },
  plugins: [],
};