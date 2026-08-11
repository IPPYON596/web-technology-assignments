import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Standard Vite + React config. CSS Modules (any *.module.css file) work
// out of the box, no extra setup needed. Component files use the .jsx
// extension so Vite's default JSX handling applies with zero extra config.
export default defineConfig({
  plugins: [react()],
});
