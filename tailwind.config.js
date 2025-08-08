/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class", // Enables class-based dark mode
    content: [
      "./src/app/**/*.{ts,tsx}",
      "./src/components/**/*.{ts,tsx}",
      "./src/lib/**/*.{ts,tsx}",
      "./src/hooks/**/*.{ts,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };
  