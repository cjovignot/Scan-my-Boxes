// main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// 🧹 Désenregistrer les anciens service workers (utile si tu avais une PWA avant)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(() => {
          console.log("🧹 Ancien service worker supprimé");
        });
      }
    })
    .catch((err) => console.warn("⚠️ Erreur service worker:", err));
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
