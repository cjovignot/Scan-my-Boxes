// frontend/src/pages/Login.tsx
import { SocialLogin } from "../components/SocialLogin";
import axiosClient from "../api/axiosClient";

const Login = () => {
  const handleLogin = async ({ token }: { token: string }) => {
    try {
      // ✅ Envoi du token Google à ton backend
      const res = await axiosClient.post("/api/user/google-login", { token });

      const data = res.data;

      // ✅ Sauvegarde de l'utilisateur dans le localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      // ⏩ Optionnel : rediriger vers un tableau de bord
      // window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("❌ Erreur Google Login :", error.response?.data || error);
      alert("Erreur de connexion Google");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <h1 className="text-2xl font-bold">Connexion</h1>
      <SocialLogin onLogin={handleLogin} />
    </div>
  );
};

export default Login;
