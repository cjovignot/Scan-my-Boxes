import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    // ✅ Active la PWA avec précautions pour Google Auth
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],

      manifest: {
        name: "Scan My Boxes",
        short_name: "ScanBoxes",
        description: "Gère tes boîtes facilement avec Scan My Boxes 📦",
        theme_color: "#030712",
        background_color: "#030712",
        display: "standalone",
        scope: "/",
        start_url: "/",
        orientation: "portrait",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      // ⚙️ Service Worker : évite de casser le flux OAuth Google
      workbox: {
        navigateFallback: "/index.html",
        runtimeCaching: [
          // 1️⃣ NE JAMAIS mettre en cache les requêtes OAuth Google
          {
            urlPattern: /^https:\/\/accounts\.google\.com\/.*/i,
            handler: "NetworkOnly",
          },
          {
            urlPattern: /^https:\/\/www\.googleapis\.com\/.*/i,
            handler: "NetworkOnly",
          },
          // 2️⃣ NE PAS mettre en cache les appels à ton backend d’auth
          {
            urlPattern:
              /^https:\/\/scan-my-boxes-api\.vercel\.app\/api\/auth\/.*/i,
            handler: "NetworkOnly",
          },
          // 3️⃣ Cache raisonnable pour le reste de ton API
          {
            urlPattern: /^https:\/\/scan-my-boxes-api\.vercel\.app\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 86400, // 1 jour
              },
            },
          },
          // 4️⃣ Cache des assets statiques
          {
            urlPattern: /\.(?:js|css|html|png|jpg|jpeg|svg|gif|ico)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 jours
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
