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
      gentle: "rgb(174,174,174)",
    },
    extend: {},
  },
  plugins: [],
}

