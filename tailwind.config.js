import typography from "@tailwindcss/typography"

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx}"],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        primary: "#182667",
        secondary: "#aaa6c3",
        tertiary: "#151030",
        fourth: "#1b7b9d",
        "black-100": "#100d25",
        "black-200": "#090325",
        "white-100": "#f3f3f3",
      },
      boxShadow: {
        card: "0px 35px 120px -15px #211e35",
      },
      screens: {
        // xs: "600px",
        // sm: "375px",
        // sml: "500px",
        sm: "800px",
        // mdl: "768px",
        lg: "960px",
        lgl: "1024px",
        xl: "1280px",
      },
      backgroundImage: {
        "hero-pattern": "url('/src/assets/bg-edporfolio.jpeg')",
      },
    },
  },
  plugins: [typography],
}

