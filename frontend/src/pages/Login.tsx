import UserForm from "../components/UserForm";
import { SocialLogin } from "../components/SocialLogin";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 🔹 Si l'utilisateur est déjà connecté, rediriger
  if (user) {
    navigate("/profile", { replace: true });
  }

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
        <SocialLogin />
      </div>
    </div>
  );
};

export default Login;
