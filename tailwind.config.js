/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Vanta violet
        brand: {
          DEFAULT: "#7c3aed",
          50: "#f5f0ff",
          100: "#e9d8fd",
          200: "#d6bcfa",
          400: "#a78bfa",
          600: "#6d28d9",
          700: "#5b21b6",
        },
        // Deep plum (marketing / dark surfaces)
        plum: {
          900: "#1e1035",
          800: "#2a1a4a",
          700: "#3b2565",
        },
        ink: {
          900: "#14121a",
          800: "#1f1b28",
          700: "#2b2636",
          600: "#3a3448",
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
