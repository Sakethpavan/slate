/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        paper: "#f7f5ef",
        moss: "#52674f",
        clay: "#b46d4f",
        sky: "#d9e9ec"
      }
    }
  },
  plugins: []
};
