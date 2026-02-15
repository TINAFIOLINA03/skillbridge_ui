/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef6f6",
          100: "#d5eaea",
          200: "#aed6d7",
          300: "#82bfc0",
          400: "#5f9ea0",
          500: "#4e8c8e",
          600: "#3f7173",
          700: "#345b5d",
          800: "#2c4a4b",
          900: "#273e3f",
        },
        sage: {
          50:  "#f4f7f2",
          100: "#e4eade",
          200: "#c9d5be",
          300: "#a5b896",
          400: "#839c70",
          500: "#668054",
          600: "#506640",
          700: "#3f5034",
          800: "#35412d",
          900: "#2d3727",
        },
        surface: "#ffffff",
        page:    "#f7f8f6",
      },
      borderRadius: {
        xl:  "12px",
        "2xl": "16px",
      },
      boxShadow: {
        soft:   "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
        card:   "0 1px 4px rgba(0,0,0,0.03), 0 6px 20px rgba(0,0,0,0.05)",
        hover:  "0 2px 8px rgba(0,0,0,0.06), 0 8px 28px rgba(0,0,0,0.07)",
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
      },
      animation: {
        fadeIn:  "fadeIn 0.3s ease-out",
        slideUp: "slideUp 0.25s ease-out",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px) scale(0.97)" },
          to:   { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
