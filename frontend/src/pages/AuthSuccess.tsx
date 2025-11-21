import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [message, setMessage] = useState("🔄 Connexion en cours...");

  useEffect(() => {
    if (auth?.user) {
      // ✅ User déjà présent dans le contexte
      setMessage("✅ Connexion réussie !");
      const timer = setTimeout(() => navigate("/profile"), 800);
      return () => clearTimeout(timer);
    } else {
      // ⚠️ Aucun user trouvé → redirection login
      setMessage("⚠️ Utilisateur introuvable.");
      const timer = setTimeout(() => navigate("/login"), 1000);
      return () => clearTimeout(timer);
    }
  }, [auth?.user, navigate]);

  const getMessageColor = () => {
    if (message.includes("🔄")) return "text-yellow-400 animate-pulse";
    if (message.includes("✅")) return "text-green-400";
    return "text-red-400";
  };

  return (
    <div className="flex items-center justify-center min-h-screen text-white bg-black">
      <p className={`text-lg ${getMessageColor()}`}>{message}</p>
    </div>
  );
};

export default AuthSuccess;
