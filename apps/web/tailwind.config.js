/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        paper: "#f7f5ef",
        primary: "var(--color-primary)",
        muted: "var(--color-muted)",
        soft: "var(--color-soft)",
        canvas: "var(--color-canvas)",
        surface: "var(--color-surface)",
        inverse: "var(--color-inverse)",
        accent: "var(--color-accent)",
        warning: "var(--color-warning)",
        info: "var(--color-info)"
      }
    }
  },
  plugins: []
};
