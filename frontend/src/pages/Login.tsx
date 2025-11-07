import UserForm from "../components/UserForm";
import { SocialLogin } from "../components/SocialLogin";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async ({ provider, token, profile }: any) => {
    try {
      const res = await axiosClient.post("api/user/google-login", {
        provider,
        token,
        profile,
      });

      const data = res.data;

      if (!data?.user) {
        throw new Error("Utilisateur non trouvé dans la réponse du serveur.");
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/home");
    } catch (error: any) {
      console.error("❌ Erreur Google Login :", error.response?.data || error);
      alert("Erreur de connexion Google");
    }
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