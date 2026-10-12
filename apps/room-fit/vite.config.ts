import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../../packages/shared"),
      "@apps": path.resolve(__dirname, "../../apps"),
    },
  },
  server: {
    port: 3010,
  },
});
