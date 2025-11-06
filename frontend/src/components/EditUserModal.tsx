// frontend/components/EditUserModal.tsx
import { useEffect, useState } from "react";
import axios from "axios";

type EditUserModalProps = {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

// Toast simple
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50">
      {message}
    </div>
  );
};

export const EditUserModal = ({ userId, isOpen, onClose, onSuccess }: EditUserModalProps) => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // ✅ Fetch user à l'ouverture ou quand userId change
  useEffect(() => {
    if (!userId || !isOpen) return;

    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/users/${userId}`);
        setFormData({ name: res.data.name, email: res.data.email, password: "" });
      } catch (err: any) {
        console.error("Erreur fetch user:", err);
        setToast(err.response?.data?.error || "Impossible de charger l'utilisateur");
      }
    };

    fetchUser();
  }, [userId, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return setToast("ID utilisateur manquant");

    setLoading(true);
    try {
      const res = await axios.patch(`/api/users/${userId}`, formData);
      setToast(res.data.message || "Utilisateur mis à jour !");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erreur update user:", err);
      setToast(err.response?.data?.error || "Erreur réseau");
    } finally {
      setLoading(false);
    }
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