import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Builds the single embeddable script, dist/clayculator.js (run after the main build).
export default defineConfig({
  plugins: [react()],
  esbuild: { charset: "ascii" }, // keep the script ASCII-only so it renders right on pages without a UTF-8 charset
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/embed.jsx",
      name: "Clayculator",
      formats: ["iife"],
      fileName: () => "clayculator.js",
    },
  },
});
