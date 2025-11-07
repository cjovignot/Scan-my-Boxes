import UserForm from "../components/UserForm";
import { SocialLogin } from "../components/SocialLogin";
import { useNavigate } from "react-router-dom";
import { useApiMutation } from "../hooks/useApiMutation";
// test
const Login = () => {
  const navigate = useNavigate();

  // ✅ Mutation pour Google Login
  const { mutate: loginWithGoogle } = useApiMutation<{ user: any }, { token: string }>(
  "/api/auth/google-login",
  "POST",
  {
    onSuccess: (data) => {
      if (!data?.user) return alert("Utilisateur non trouvé");
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/profile");
    },
    onError: (err) => {
      console.error("Erreur Google login:", err);
      alert("Erreur de connexion Google", error);
    },
  }
);

const handleGoogleLogin = ({ token }: { token: string }) => {
  loginWithGoogle({ token });
};

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 text-white bg-gray-950">
      <h1 className="text-2xl font-bold text-yellow-400">Connexion</h1>

      <UserForm />

      <div className="mt-6">
        <SocialLogin onLogin={handleGoogleLogin} />
      </div>
    </div>
  );
};

export default Login;