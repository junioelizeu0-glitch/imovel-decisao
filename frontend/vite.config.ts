import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    // Aumenta o limite de alerta de tamanho de chunk para 1000 kB (1 MB)
    chunkSizeWarningLimit: 1000,
  },
});
