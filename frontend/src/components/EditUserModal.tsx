// frontend/components/EditUserModal.tsx
import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import { useApiMutation } from "../hooks/useApiMutation";

type EditUserModalProps = {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

// Simple toast pour afficher un message temporaire
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg">
      {message}
    </div>
  );
};

export const EditUserModal = ({ userId, isOpen, onClose, onSuccess }: EditUserModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [toast, setToast] = useState<string | null>(null);

  // ✅ Charger automatiquement l’utilisateur
  const { data: user } = useApi<{
    _id: string;
    name: string;
    email: string;
  }>(userId ? `/api/user/${userId}` : "", { skip: !userId });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
      });
    }
  }, [user]);

  // ✅ Mutation mise à jour
  const { mutate, loading, error } = useApiMutation<
    { message: string },
    Partial<typeof formData>
  >(userId ? `/api/user/${userId}` : "", "PATCH", {
    onSuccess: (data) => {
      setToast(data.message); // afficher le message succès
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      setToast(err.response?.data?.error || "Erreur réseau");
    },
  });

  if (!isOpen) return null; // cacher la modal si fermée

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return setToast("ID utilisateur manquant");
    mutate(formData);
  };

  return (
    <>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="w-full max-w-md p-6 bg-gray-900 rounded-xl text-white shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-yellow-400">
            Modifier l’utilisateur
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm">Nom</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Nouveau mot de passe (optionnel)</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

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
                className="px-4 py-2 text-sm font-semibold bg-yellow-500 text-black rounded hover:bg-yellow-400"
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