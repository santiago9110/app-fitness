import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Fit Finance",
        short_name: "FitFinance",
        description: "Gestión de pagos y rutinas para gimnasios",
        theme_color: "#222",
        background_color: "#222",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/assets/favicon.ico",
            sizes: "48x48",
            type: "image/x-icon",
          },
          {
            src: "/assets/logo192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/assets/icon-round.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        // Puedes personalizar aquí para offline y push notifications
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
  },
});
