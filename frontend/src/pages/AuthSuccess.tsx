import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApiMutation } from "../hooks/useApiMutation";
import { useAuth } from "../contexts/AuthContext";

const AuthSuccess = () => {
  const [params] = useSearchParams();
  const email = params.get("email");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const { mutate } = useApiMutation<{ user: any }, { email: string }>(
    `${import.meta.env.VITE_API_URL}/api/user/by-email`,
    "POST",
    {
      onSuccess: (data) => {
        if (data.user) {
          setUser(data.user);
          navigate("/profile"); // ou ta page principale
        } else {
          navigate("/login");
        }
      },
      onError: () => {
        navigate("/login");
      },
    }
  );

  useEffect(() => {
    if (email) {
      mutate({ email });
    } else {
      navigate("/login");
    }
  }, [email]);

  return (
    <div className="flex items-center justify-center min-h-screen text-white bg-gray-950">
      <p className="text-lg text-yellow-400 animate-pulse">
        🔄 Connexion en cours...
      </p>
    </div>
  );
};

export default AuthSuccess;
