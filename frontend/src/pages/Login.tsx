import PageWrapper from "../components/PageWrapper";
import { SocialLogin } from "../components/SocialLogin";
import axios from "../api/axiosClient";

const Login = () => {
  const handleSocialLogin = async ({ provider, token, profile }: any) => {
    try {
      const res = await axios.post("/api/auth/social-login", {
        provider,
        token,
        profile,
      });
      console.log("✅ connecté:", res.data.user);
    } catch (err: any) {
      console.error("Erreur login social:", err.response?.data || err.message);
    }
  };

  return (
    <PageWrapper>
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="p-8 bg-gray-800 rounded-xl shadow-lg space-y-4 w-80 text-center">
          <h1 className="text-xl font-semibold">Connexion</h1>
          <SocialLogin onLogin={handleSocialLogin} />
        </div>
      </div>
    </PageWrapper>
  );
};

export default Login;