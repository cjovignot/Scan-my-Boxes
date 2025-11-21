import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const UserForm = () => {
  const { login, signup, setUser } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordRules = {
    length: {
      label: "Au moins 8 caractères",
      test: (pw: string) => pw.length >= 8,
    },
    uppercase: {
      label: "Au moins une majuscule",
      test: (pw: string) => /[A-Z]/.test(pw),
    },
    lowercase: {
      label: "Au moins une minuscule",
      test: (pw: string) => /[a-z]/.test(pw),
    },
    number: {
      label: "Au moins un chiffre",
      test: (pw: string) => /[0-9]/.test(pw),
    },
    symbol: {
      label: "Au moins un symbole",
      test: (pw: string) => /[^A-Za-z0-9]/.test(pw),
    },
  };

  const [passwordStatus, setPasswordStatus] = useState(
    Object.keys(passwordRules).reduce(
      (acc, key) => ({ ...acc, [key]: false }),
      {}
    )
  );

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pw = e.target.value;
    setFormData((prev) => ({ ...prev, password: pw }));

    const newStatus: Record<string, boolean> = {};
    for (const key in passwordRules) {
      newStatus[key] =
        passwordRules[key as keyof typeof passwordRules].test(pw);
    }
    setPasswordStatus(newStatus);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const user = await signup(
          formData.name,
          formData.email,
          formData.password
        );
        setUser(user);
        navigate(`/auth/success?email=${encodeURIComponent(user.email)}`);
      } else {
        const user = await login(formData.email, formData.password);
        setUser(user);
        navigate(`/auth/success?email=${encodeURIComponent(user.email)}`);
      }

      setFormData({ name: "", email: "", password: "" });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

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
            onChange={handlePasswordChange}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400"
          />
          <ul className="mt-1 text-xs">
            {mode === "signup" &&
              Object.keys(passwordRules).map((key) => (
                <li
                  key={key}
                  className={`
                  ${passwordStatus[key] ? "text-green-400" : "text-gray-400"}
                `}
                >
                  {passwordStatus[key] && "🗸 "}
                  {passwordRules[key as keyof typeof passwordRules].label}
                </li>
              ))}
          </ul>
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
