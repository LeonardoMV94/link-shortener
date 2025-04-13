/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{astro,html,js,vue}"],
    theme: {
      extend: {},
    },
    plugins: [require("daisyui")],
  };