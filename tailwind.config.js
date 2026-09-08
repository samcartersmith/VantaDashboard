/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#5b4ef0",
          50: "#eeedfe",
          100: "#cecbf6",
          200: "#afa9ec",
          400: "#7f77dd",
          600: "#534ab7",
          700: "#3c3489",
        },
        ink: {
          900: "#0b0b0f",
          800: "#16161d",
          700: "#22222c",
          600: "#33333f",
        },
        sev: {
          critical: "#e24b4a",
          high: "#ef9f27",
          medium: "#d4a017",
          low: "#888780",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};
