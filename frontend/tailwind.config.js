/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables dark mode via class strategy
  theme: {
    extend: {
      colors: {
        lightBg: '#f3f4f6',    // Soft light background
        darkBg: '#1f2937',     // Elegant dark background
        accent: '#6366f1',     // Indigo accent for highlights
        textLight: '#111827',  // Dark text for light mode
        textDark: '#f9fafb',   // Light text for dark mode
      },
      backgroundImage: {
        'gradient-light': 'linear-gradient(to bottom right, #e0f2f1, #fce4ec)',
        'gradient-dark': 'linear-gradient(to bottom right, #1f2937, #111827)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        popIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        popIn: 'popIn 0.3s ease-out forwards',
      },
      transitionProperty: {
        spacing: 'margin, padding',
        height: 'height',
      },
    },
  },
  plugins: [],
};
