/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    colors: {
      backdrop: "rgb(15, 15, 15)",
      foreground: "rgb(241, 241, 241)",
      container: "rgb(39, 39, 39)",
      containerHover: "rgb(63, 63, 63)",
      innerContainer: "rgb(29, 29, 29)",
      gentle: "rgb(174,174,174)",
      button: "rgb(73,73,73)",
      buttonHover: "rgb(85,85,85)"
    },
    extend: {},
  },
  plugins: [],
}

