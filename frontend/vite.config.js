import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),  // Alias configuration moved here
    },
  },
});
