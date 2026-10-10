import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: path.resolve(import.meta.dirname, "../../postcss.config.js"),
  },
  resolve: {
    alias: {
      "@shared": path.resolve(import.meta.dirname, "../../packages/shared"),
      "@apps": path.resolve(import.meta.dirname, "../"),
    },
  },
});
