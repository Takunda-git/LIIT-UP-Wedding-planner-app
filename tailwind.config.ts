/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "wedding-pink": "#FFC0CB", // A soft pink
        "wedding-light-red": "#FF6B6B", // A muted red
        "wedding-light-blue": "#ADD8E6", // A light blue
        "wedding-dark-pink": "#E0BBE4", // A slightly darker pink for contrast
        "wedding-accent": "#957DAD", // A complementary purple/lavender
        "wedding-background": "#F8F8F8", // Light background
      },
    },
  },
  plugins: [],
}
