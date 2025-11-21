import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export const SocialLogin = () => {
  const [isPWA, setIsPWA] = useState(false);
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;

    setIsPWA(isStandalone);

    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const handleCredentialResponse = async (response: any) => {
      if (!response?.credential) return;

      try {
        // Appelle le contexte pour login Google
        await loginWithGoogle(response.credential);
      } catch (err) {
        console.error("❌ Google login failed:", err);
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
  }, [loginWithGoogle]);

  const handlePwaLogin = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    window.location.href = `${API_URL}/api/auth/google-redirect?source=pwa`;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {!isPWA ? (
        <div id="googleSignIn" className="rounded-full shadow-md"></div>
      ) : (
        <button
          onClick={handlePwaLogin}
          className="flex items-center w-[250px] h-[50px] px-1 py-3 transition-all duration-200 bg-[#131314] rounded-full shadow hover:shadow-lg hover:scale-105"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-10 p-2 mr-3 bg-white rounded-full"
          />
          <span className="flex justify-center w-full text-sm font-medium text-white">
            Sign in with Google
          </span>
        </button>
      )}
    </div>
  );
};
