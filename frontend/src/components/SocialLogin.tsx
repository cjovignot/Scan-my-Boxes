import { useEffect, useState } from "react";

type SocialLoginProps = {
  onLogin: (data: { token: string }) => void;
};

export const SocialLogin = ({ onLogin }: SocialLoginProps) => {
  const [logs, setLogs] = useState<string[]>([]);

  const log = (message: string) => {
    console.log(message);
    setLogs((prev) => [...prev, message]);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const API_URL = import.meta.env.VITE_API_URL;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;

    const redirectUrl = `${API_URL}/api/auth/google-redirect?source=pwa`;

    log(`🔹 GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}`);
    log(`🔹 API_URL: ${API_URL}`);
    log(`🔹 Mode PWA: ${isStandalone}`);
    log(`🔹 URL de redirection: ${redirectUrl}`);

    // 🟡 Si on est en PWA, ouverture directe dans un nouvel onglet
    if (isStandalone) {
      log(
        "🟡 PWA détectée → ouverture du flux Google OAuth dans le navigateur..."
      );
      window.open(redirectUrl, "_blank");
      return;
    }

    // 🟢 Mode navigateur classique → flux popup Google Identity
    const handleCredentialResponse = (response: any) => {
      if (response?.credential) {
        onLogin({ token: response.credential });
      }
    };

    // @ts-ignore
    window.google?.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
      disable_auto_prompt: true,
    });

    // @ts-ignore
    window.google?.accounts.id.renderButton(
      document.getElementById("googleSignIn")!,
      {
        theme: "filled_black",
        size: "large",
        shape: "pill",
        logo_alignment: "left",
        width: 250,
      }
    );

    log("🟢 Bouton Google rendu.");
  }, [onLogin]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        id="googleSignIn"
        className="overflow-hidden transition-transform duration-200 rounded-full shadow-md hover:shadow-lg hover:scale-105"
      ></div>

      {/* 🔍 Zone de logs visible même sur mobile */}
      <div className="w-full max-w-xs p-2 mt-4 text-xs text-gray-400 bg-gray-900 rounded-lg">
        {logs.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};
