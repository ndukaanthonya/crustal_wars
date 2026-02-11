// vite.config.js
// Configures Vite as our frontend dev server and bundler

import { defineConfig } from "vite";

export default defineConfig({
  // The root folder where Vite looks for index.html
  root: "frontend",

  // Dev server settings
  server: {
    port: 3000,
    open: true,
  },

  // Build output settings (for production deployment)
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },

  define: {
    "process.env": {},
  },
});
