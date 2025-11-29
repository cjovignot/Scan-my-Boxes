import GoogleButton from "../components/GoogleButton";
import { useAuth } from "../contexts/AuthContext";
import UserForm from "../components/Authentication/UserForm";

export default function Login() {
  const { user } = useAuth();

  if (user) {
    window.location.href = "/Home";
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
        <GoogleButton />
      </div>
    </div>
  );
}
