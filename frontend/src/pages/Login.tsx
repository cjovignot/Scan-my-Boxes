import UserForm from "../components/UserForm";
import { SocialLogin } from "../components/SocialLogin";
import { useNavigate } from "react-router-dom";
import { useApiMutation } from "../hooks/useApiMutation";

const Login = () => {
  const navigate = useNavigate();

  // ✅ Mutation Google Login
  const { mutate: loginWithGoogle } = useApiMutation<
    { user: any }, // réponse attendue
    { provider: string; token: string; profile: any } // payload envoyé
  >("/api/auth/google-login", "POST", {
    onSuccess: (data) => {
      if (!data?.user) {
        alert("Utilisateur non trouvé dans la réponse du serveur.");
        return;
      }
      // ✅ Sauvegarde utilisateur
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/home");
    },
    onError: (error) => {
      console.error("❌ Erreur Google Login:", error);
      alert("Erreur de connexion via Google:", error);
    },
  });

  const handleLogin = ({ provider, token, profile }: any) => {
    loginWithGoogle({ provider, token, profile });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 text-white bg-gray-950">
      <h1 className="text-2xl font-bold text-yellow-400">Connexion</h1>

      <UserForm />

      <div className="mt-6">
        <SocialLogin onLogin={handleLogin} />
      </div>
    </div>
  );
};

export default Login;