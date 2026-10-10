import path from "path";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.join(import.meta.dirname, "./index.html"),
    path.join(import.meta.dirname, "./src/**/*.{js,ts,jsx,tsx}"),
    path.join(import.meta.dirname, "./apps/**/*.{js,ts,jsx,tsx,html}"),
    path.join(import.meta.dirname, "./packages/**/*.{js,ts,jsx,tsx}"),
  ],
  theme: {
    extend: {
      colors: {
        toss: {
          blue: "#3182F6",
          blueDark: "#1b64da",
          blueLight: "#E8F3FF",
          bg: "#F2F4F6",
          surface: "#FFFFFF",
          text: "#191F28",
          subtext: "#4E5968",
          muted: "#8B95A1",
          border: "#E5E8EB",
          red: "#F04452",
          redLight: "#FEECEE",
          green: "#04C759",
          greenLight: "#E6F9EE",
          orange: "#FF7C1A",
          orangeLight: "#FFF1E5",
          purple: "#7952F5",
          purpleLight: "#F2EDFD",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Pretendard",
          "Apple SD Gothic Neo",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        toss: "0 2px 12px 0 rgba(0, 0, 0, 0.04)",
        tossHover: "0 8px 24px 0 rgba(0, 0, 0, 0.08)",
        modal: "0 20px 40px -15px rgba(0, 0, 0, 0.2)",
      },
      borderRadius: {
        toss: "20px",
        tossSm: "12px",
        tossLg: "28px",
      },
    },
  },
  plugins: [],
};
