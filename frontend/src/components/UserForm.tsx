import { useState } from "react";
import { useApiMutation } from "../hooks/useApiMutation";
import { useNavigate } from "react-router-dom";

const UserForm = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "login">("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const loginMutation = useApiMutation<
    {
      message: string;
      token: string;
      user: {
        _id: string;
        name: string;
        email: string;
        role?: string;
        provider?: string;
      };
    },
    { email: string; password: string }
  >("/api/auth/login", "POST", {
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setFormData({ name: "", email: "", password: "" });
      window.dispatchEvent(new Event("userLogin"));

      // ✅ Redirection avec l’email dans l’URL
      navigate(`/auth/success?email=${encodeURIComponent(data.user.email)}`);
    },
    onError: (err) => console.error("Erreur connexion :", err),
  });

  // ✅ Mutation SIGNUP
  const signupMutation = useApiMutation<
    { message: string; user: { _id: string; name: string; email: string } },
    typeof formData
  >("/api/user", "POST", {
    onSuccess: () => {
      setFormData({ name: "", email: "", password: "" });
    },
    onError: (err) => console.error("Erreur création utilisateur :", err),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "signup") {
      await signupMutation.mutate(formData);
    } else {
      await loginMutation.mutate({
        email: formData.email,
        password: formData.password,
      });
    }
  };

  // ✅ Extraction dynamique de l’état selon le mode
  const loading =
    mode === "signup" ? signupMutation.loading : loginMutation.loading;
  const error = mode === "signup" ? signupMutation.error : loginMutation.error;
  const data = mode === "signup" ? signupMutation.data : loginMutation.data;

  return (
    <div className="max-w-md p-6 mx-auto text-white shadow-lg bg-gray-950 rounded-2xl">
      <h2 className="mb-4 text-lg font-semibold text-yellow-400">
        {mode === "signup" ? "Créer un compte" : "Se connecter"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label className="block mb-1 text-sm">Nom</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400"
            />
          </div>
        )}

        <div>
          <label className="block mb-1 text-sm">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">Mot de passe</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 font-semibold text-gray-900 transition bg-yellow-500 rounded-lg hover:bg-yellow-400 disabled:opacity-50"
        >
          {loading
            ? mode === "signup"
              ? "Création..."
              : "Connexion..."
            : mode === "signup"
            ? "Créer le compte"
            : "Se connecter"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {data && <p className="mt-3 text-sm text-green-400">{data.message}</p>}

      <div className="mt-4 text-center">
        {mode === "signup" ? (
          <p className="text-sm">
            Déjà un compte ?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-yellow-400 hover:underline"
            >
              Se connecter
            </button>
          </p>
        ) : (
          <p className="text-sm">
            Pas encore de compte ?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="text-yellow-400 hover:underline"
            >
              Créer un compte
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default UserForm;
