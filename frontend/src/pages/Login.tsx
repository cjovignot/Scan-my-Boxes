import UserForm from "../components/UserForm";
import { SocialLogin } from "../components/SocialLogin";
import { useNavigate } from "react-router-dom";
import { useApiMutation } from "../hooks/useApiMutation";
import { useAuth } from "../contexts/AuthContext";

interface GoogleLoginResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string; // si ton API renvoie un JWT
  };
}

interface GoogleLoginPayload {
  token: string;
}

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // 🔹 Mutation Google Login
  const { mutate: loginWithGoogle, loading } = useApiMutation<
    GoogleLoginResponse,
    GoogleLoginPayload
  >(`/api/auth/google-login`, "POST", {
    onSuccess: (data) => {
      if (!data?.user) return alert("Utilisateur non trouvé");

      // 🔹 Mettre à jour le contexte Auth
      setUser(data.user);

      // 🔹 Redirection après login
      navigate("/profile");
    },
    onError: (err) => {
      console.error("Erreur Google login:", err);
      alert("Erreur de connexion Google");
    },
  });

  const handleGoogleLogin = (payload: GoogleLoginPayload) => {
    loginWithGoogle(payload);
  };

  return (
    <div className="flex flex-col items-center px-6 py-10 text-white">
      {/* 🔹 Formulaire utilisateur classique */}
      <div className="w-full max-w-sm mt-4 animate-fadeIn">
        <UserForm />
      </div>

      {/* 🔸 Séparateur stylé */}
      <div className="relative w-full max-w-sm my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 text-sm text-gray-400 bg-gray-950">OU</span>
        </div>
      </div>

      {/* 🔹 Connexion Google */}
      <div className="mt-2">
        <SocialLogin onLogin={handleGoogleLogin} disabled={loading} />
      </div>
    </div>
  );
};

export default Login;
