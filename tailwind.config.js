/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // ✅ Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        geist: ['Geist', 'sans-serif'],
        geistMono: ['Geist_Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

