// main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// import { registerSW } from "virtual:pwa-register";
import "./index.css";
import App from "./App.tsx";

// // ⚙️ Active l'auto-update et prévient l'utilisateur
// const updateSW = registerSW({
//   onNeedRefresh() {
//     if (confirm("🚀 Nouvelle version disponible. Recharger l’application ?")) {
//       updateSW(true);
//     }
//   },
//   onOfflineReady() {
//     console.log("🌙 Application prête pour un usage hors ligne !");
//   },
// });
// // 🧹 Désenregistrer les anciens service workers (utile si tu avais une PWA avant)
// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker
//     .getRegistrations()
//     .then((registrations) => {
//       for (const registration of registrations) {
//         registration.unregister().then(() => {
//           console.log("🧹 Ancien service worker supprimé");
//         });
//       }
//     })
//     .catch((err) => console.warn("⚠️ Erreur service worker:", err));
// }

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
