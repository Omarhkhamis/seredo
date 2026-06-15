import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#F7FAFC",
        mist: "#EEF3F8",
        ink: "#0C1024",
        muted: "#475569",
        line: "#D7E0EA",
        brand: {
          50: "#EEF3F8",
          100: "#E6EAF4",
          300: "#7C8BBA",
          500: "#2F4685",
          600: "#25396E",
          700: "#1A2A55",
          800: "#16224A",
          900: "#0F1733",
        },
        teal: {
          500: "#0D5C63",
          300: "#7CB4C9",
        },
        copper: {
          500: "#B46B3D",
        },
      },
      fontFamily: {
        body: ["var(--font-body)"],
        display: ["var(--font-display)"],
      },
      boxShadow: {
        soft: "0 12px 34px rgba(15, 23, 51, 0.08)",
        strong: "0 26px 70px rgba(15, 23, 51, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
