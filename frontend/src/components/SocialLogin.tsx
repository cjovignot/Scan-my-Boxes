// frontend/components/SocialLogin.tsx
import { useEffect } from "react";
import jwtDecode from "jwt-decode";

declare global {
  interface Window {
    google?: any;
  }
}

type Props = {
  onLogin: (data: { provider: "google"; token: string; profile?: any }) => void;
};

export const SocialLogin = ({ onLogin }: Props) => {
  useEffect(() => {
    if (!window.google) {
      console.warn("⚠️ Google script not loaded.");
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("❌ Missing Google Client ID in .env");
      return;
    }

    // ✅ Initialisation du SDK Google
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        const token = response.credential;
        const profile = jwtDecode(token);
        onLogin({ provider: "google", token, profile });
      },
    });

    // ✅ Rendu du bouton de connexion
    const btn = document.getElementById("google-btn");
    if (btn && btn.childElementCount === 0) {
      window.google.accounts.id.renderButton(btn, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 250,
      });
    }

    // ❌ Retirer One Tap si tu veux éviter le warning
    // window.google.accounts.id.prompt();
  }, [onLogin]);

  return (
    <div className="flex flex-col items-center space-y-3">
      <div id="google-btn" />
    </div>
  );
};
