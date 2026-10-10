import path from "path";

export default {
  plugins: {
    tailwindcss: {
      config: path.resolve(import.meta.dirname, "./tailwind.config.js"),
    },
    autoprefixer: {},
  },
};
