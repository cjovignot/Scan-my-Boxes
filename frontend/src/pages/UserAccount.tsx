import { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { useApiMutation } from "../hooks/useApiMutation";

const UserAccount = () => {
  const { user, setUser, logout } = useAuth()!;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user]);

  // ==============================
  // 🔹 PATCH - Update User
  // ==============================
  const { mutate: updateUser, loading: updating } = useApiMutation(
    `/api/user/${user?._id}`,
    "PATCH",
    {
      onSuccess: (res) => {
        setUser(res.user ?? res);
        alert("✅ Profil mis à jour !");
        navigate("/profile");
      },
      onError: () => {
        alert("Erreur lors de la mise à jour.");
      },
    }
  );

  // ==============================
  // 🔹 DELETE - Supprimer User
  // ==============================
  const { mutate: deleteUser, loading: deleting } = useApiMutation(
    `/api/user/${user?._id}`,
    "DELETE",
    {
      onSuccess: () => {
        logout();
        alert("🗑️ Compte supprimé !");
        navigate("/register");
      },
      onError: () => {
        alert("❌ Erreur lors de la suppression du compte.");
      },
    }
  );

  const handleDeleteAccount = () => {
    if (!user?._id) return alert("Utilisateur introuvable.");

    const ok = confirm(
      "❌ Es-tu sûr de vouloir supprimer ton compte ? Cette action est irréversible."
    );
    if (!ok) return;

    deleteUser();
  };

  const handleSave = () => {
    updateUser(formData);
  };

  if (!user) return null;

  return (
    <PageWrapper>
      <div className="flex flex-col items-center px-6 py-10 text-white">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center self-start gap-2 mb-6 text-sm text-gray-400 hover:text-yellow-400"
        >
          <ArrowLeft size={16} />
          Retour
        </button>

        <motion.div className="w-full max-w-md p-6 text-center bg-gray-900 border border-gray-800 shadow-lg rounded-2xl">
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            {user.picture ? (
              <img
                src={user.picture}
                alt="avatar"
                className="w-24 h-24 border-2 border-yellow-400 rounded-full shadow-md"
              />
            ) : (
              <div className="flex items-center justify-center w-24 h-24 text-3xl font-bold text-yellow-400 bg-gray-900 border-2 border-yellow-400 rounded-full shadow-md">
                {user.name?.charAt(0) || "?"}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="flex flex-col gap-3 mt-8 text-left">
            <label className="text-sm text-gray-400">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="px-3 py-2 text-sm text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-yellow-400"
            />

            <label className="text-sm text-gray-400">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="px-3 py-2 text-sm text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-yellow-400"
            />
          </div>

          <div className="flex flex-col gap-3 mt-8">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={updating}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-black bg-yellow-400 rounded-full hover:bg-yellow-500 disabled:opacity-50"
            >
              <Save size={16} />
              Enregistrer les modifications
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-400 border border-red-600 rounded-full hover:bg-red-600/20 disabled:opacity-50"
            >
              <Trash2 size={16} />
              {deleting ? "Suppression..." : "Supprimer mon compte"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default UserAccount;