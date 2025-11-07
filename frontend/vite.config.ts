import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // VitePWA({
    //   registerType: "autoUpdate", // 🔄 Service Worker mis à jour automatiquement
    //   includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
    //   manifest: {
    //     name: "Scan My Boxes",
    //     short_name: "ScanBoxes",
    //     description: "Gère tes boîtes facilement avec Scan My Boxes 📦",
    //     theme_color: "#030712",
    //     background_color: "#030712",
    //     display: "standalone",
    //     scope: "/",
    //     start_url: "/",
    //     orientation: "portrait",
    //     icons: [
    //       {
    //         src: "/icons/icon-192x192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/icons/icon-512x512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/icons/maskable-icon-512x512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //         purpose: "maskable",
    //       },
    //     ],
    //   },
    //   workbox: {
    //     runtimeCaching: [
    //       {
    //         // Cache les requêtes vers ton API Vercel
    //         urlPattern: /^https:\/\/scan-my-boxes-api\.vercel\.app\/api\/.*/i,
    //         handler: "NetworkFirst",
    //         options: {
    //           cacheName: "api-cache",
    //           expiration: {
    //             maxEntries: 50,
    //             maxAgeSeconds: 86400, // 1 jour
    //           },
    //         },
    //       },
    //       {
    //         // Cache les assets statiques (images, JS, CSS, etc.)
    //         urlPattern: /\.(?:js|css|html|png|jpg|jpeg|svg|gif|ico)$/i,
    //         handler: "CacheFirst",
    //         options: {
    //           cacheName: "static-assets",
    //           expiration: {
    //             maxEntries: 100,
    //             maxAgeSeconds: 7 * 24 * 60 * 60, // 7 jours
    //           },
    //         },
    //       },
    //     ],
    //   },
    // }),
  ],

  server: {
    headers: {
      // Empêche le cache sur le HTML, pour forcer le navigateur à recharger l’app
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  },

  build: {
    rollupOptions: {
      output: {
        // Ajoute des hash aux fichiers statiques => garantit leur rechargement
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
});
