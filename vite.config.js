import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({ base: "./", plugins: [react()], test: { include: ["tests/**/*.test.js"] }, server: { proxy: { "/api": "http://localhost:8787" } } });
