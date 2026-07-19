/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  corePlugins: {
    // Disabled: index.css already ships a hand-written reset. Running
    // Tailwind's own preflight reset alongside it would silently
    // change existing element defaults (margins, headings, buttons,
    // etc.) across the whole app. Utility classes (flex, gap-*, etc.)
    // still work normally with preflight off.
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // Mirrors src/styles/index.css custom properties so Tailwind
        // utilities (e.g. `bg-jet`, `text-accent`) stay visually
        // consistent with the existing hand-styled UI.
        jet: "hsl(0, 0%, 22%)",
        onyx: "hsl(240, 1%, 17%)",
        "eerie-black-1": "hsl(240, 2%, 13%)",
        "eerie-black-2": "hsl(240, 2%, 12%)",
        "smoky-black": "hsl(0, 0%, 7%)",
        accent: "hsl(45, 100%, 72%)",
        "vegas-gold": "hsl(45, 54%, 58%)",
        "light-gray": "hsl(0, 0%, 84%)",
        danger: "hsl(0, 43%, 51%)",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
