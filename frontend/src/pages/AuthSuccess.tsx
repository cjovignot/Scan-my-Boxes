import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApiMutation } from "../hooks/useApiMutation";
import { useAuth } from "../contexts/AuthContext";

const AuthSuccess = () => {
  const [params] = useSearchParams();
  const email = params.get("email");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [message, setMessage] = useState("🔄 Connexion en cours...");

  const { mutate } = useApiMutation<{ user: any }>(
    // 👇 on appelle la route GET mais avec une "mutation" personnalisée
    `${import.meta.env.VITE_API_URL}/api/user/by-email/${email}`,
    "GET",
    {
      onSuccess: (data) => {
        if (data?.user) {
          setUser(data.user);
          setMessage("✅ Connexion réussie !");
          setTimeout(() => navigate("/profile"), 800);
        } else {
          setMessage("⚠️ Utilisateur introuvable.");
          setTimeout(() => navigate("/login"), 1000);
        }
      },
      onError: (err) => {
        console.error("❌ Erreur de connexion :", err);
        setMessage("❌ Erreur lors de la connexion.");
        setTimeout(() => navigate("/login"), 1000);
      },
    }
  );

  useEffect(() => {
    if (!email) {
      setMessage("⚠️ Email manquant.");
      setTimeout(() => navigate("/login"), 800);
      return;
    }

    // 👇 On déclenche la "mutation" GET manuellement
    mutate();
  }, [email]);

  return (
    <div className="flex items-center min-h-screen justify-center text-white bg-gray-950">
      <p
        className={`text-lg ${
          message.includes("🔄")
            ? "text-yellow-400 animate-pulse"
            : message.includes("✅")
            ? "text-green-400"
            : "text-red-400"
        }`}
      >
        {message}
      </p>
    </div>
  );
};

export default AuthSuccess;
