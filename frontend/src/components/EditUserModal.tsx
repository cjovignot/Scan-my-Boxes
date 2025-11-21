import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import { useApiMutation } from "../hooks/useApiMutation";
import { useAuth } from "../contexts/useAuth";

type EditUserModalProps = {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

// Toast simple
const Toast = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed px-4 py-2 text-white bg-gray-800 rounded shadow-lg bottom-4 right-4">
      {message}
    </div>
  );
};

export const EditUserModal = ({
  userId,
  isOpen,
  onClose,
  onSuccess,
}: EditUserModalProps) => {
  const { user: currentUser, setUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [toast, setToast] = useState<string | null>(null);

  // 🔹 Fetch user pour pré-remplissage
  const { data: fetchedUser } = useApi<{
    _id: string;
    name: string;
    email: string;
    role: string;
  }>(`/api/user/${userId}`, { skip: !userId });

  useEffect(() => {
    if (fetchedUser) {
      setFormData({
        name: fetchedUser.name,
        email: fetchedUser.email,
        password: "",
        role: fetchedUser.role || "user",
      });
    }
  }, [fetchedUser]);

  // 🔹 PATCH user
  const { mutate, loading, error } = useApiMutation<
    {
      message: string;
      updatedUser?: { name: string; email: string; role: string };
    },
    Partial<typeof formData>
  >("", "PATCH", {
    onSuccess: (data) => {
      setToast(data.message || "Utilisateur mis à jour !");

      // 🔹 Met à jour le contexte si l'utilisateur modifié est celui connecté
      if (currentUser && currentUser._id === userId && data.updatedUser) {
        setUser({ ...currentUser, ...data.updatedUser });
      }

      onSuccess?.();
      onClose();
    },
    onError: (err: any) => {
      setToast(
        err?.response?.data?.error ||
          err?.message ||
          "Erreur lors de la mise à jour"
      );
    },
  });

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return setToast("ID utilisateur manquant");

    await mutate(formData, { url: `/api/user/${userId}` });
  };

  return (
    <>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="w-full max-w-md p-6 text-white shadow-lg bg-gray-950 rounded-xl">
          <h2 className="mb-4 text-lg font-semibold text-yellow-400">
            Modifier l’utilisateur
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom */}
            <div>
              <label className="block mb-1 text-sm">Nom</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 text-sm">Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block mb-1 text-sm">
                Nouveau mot de passe (optionnel)
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
              />
            </div>

            {/* Rôle */}
            <div>
              <label className="block mb-1 text-sm">Rôle</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            {/* Boutons */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-700 rounded hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-black bg-yellow-500 rounded hover:bg-yellow-400"
              >
                {loading ? "Sauvegarde..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
