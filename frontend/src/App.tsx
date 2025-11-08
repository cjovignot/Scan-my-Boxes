import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import MobileLayout from "./layouts/MobileLayout";
import Home from "./pages/Home";
import Examples from "./pages/Examples";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AuthSuccess from "./pages/AuthSuccess";
import { AuthProvider } from "./contexts/AuthProvider";
import { useEffect } from "react";

function App() {
  const location = useLocation();

  // ✅ (1) Enregistrement du Service Worker (uniquement en production)
  useEffect(() => {
    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) =>
            console.log("🟢 Service Worker enregistré :", reg.scope)
          )
          .catch((err) => console.error("🔴 Erreur Service Worker :", err));
      });
    } else {
      console.log("⚙️ Service Worker ignoré (mode développement)");
    }
  }, []);

  // ✅ (2) Détection du mode PWA (standalone)
  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone; // support iOS

    if (isStandalone) {
      console.log("📱 App lancée en mode PWA standalone");
      // Optionnel : tu pourrais stocker ça dans ton contexte Auth ou analytics
    } else {
      console.log("🌐 App lancée dans le navigateur classique");
    }
  }, []);

  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route element={<MobileLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/examples" element={<Examples />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </AuthProvider>
  );
}

export default App;
