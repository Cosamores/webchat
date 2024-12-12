/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',   
        secondary: '#10b981', 
        accent: '#fbbf24',    
        neutral: '#374151',   
        base: '#f3f4f6',      
        dark: '#111827',      
      },
      fontSize: {
        xs: ['0.75rem', '1rem'],   
        sm: ['0.875rem', '1.25rem'], 
        base: ['1rem', '1.5rem'],    
        lg: ['1.125rem', '1.75rem'], 
        xl: ['1.25rem', '1.75rem'],  
        '2xl': ['1.5rem', '2rem'],   
      },
    },
  },
  plugins: [],
};