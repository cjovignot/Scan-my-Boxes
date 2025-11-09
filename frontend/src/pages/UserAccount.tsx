import { useEffect } from "react";
import PageWrapper from "../components/PageWrapper";
import axiosClient from "../api/axiosClient";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

const UserAccount = () => {
  const { user, logout, refetchUser } = useAuth()!;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const handleDeleteAccount = async () => {
    if (!user?._id) return alert("Utilisateur introuvable.");
    const confirmDelete = window.confirm(
      "❌ Es-tu sûr de vouloir supprimer ton compte ? Cette action est irréversible."
    );
    if (!confirmDelete) return;

    try {
      await axiosClient.delete(`/api/user/${user._id}`);
      logout();
      alert("Compte supprimé avec succès.");
      navigate("/register");
    } catch (error: any) {
      console.error("Erreur suppression :", error);
      alert("Erreur lors de la suppression du compte.");
    }
  };

  const handleSave = async () => {
    try {
      await axiosClient.put(`/api/user/${user?._id}`, user);
      alert("✅ Profil mis à jour !");
      refetchUser?.();
    } catch (error) {
      console.error("Erreur mise à jour :", error);
      alert("Erreur lors de la mise à jour du profil.");
    }
  };

  if (!user) return null;

  return (
    <PageWrapper>
      <div className="flex flex-col items-center px-6 py-10 text-white">
        {/* 🧭 Bouton retour */}
        <button
          onClick={() => navigate(-1)}
          className="self-start flex items-center gap-2 mb-6 text-sm text-gray-400 hover:text-yellow-400"
        >
          <ArrowLeft size={16} />
          Retour
        </button>

        {/* 🧩 Carte profil détaillé */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          className="w-full max-w-md p-6 text-center bg-gray-900 border border-gray-800 shadow-lg rounded-2xl"
        >
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            {user.picture ? (
              <img
                src={user.picture}
                alt="avatar"
                className="w-24 h-24 border-2 border-yellow-400 rounded-full shadow-md"
              />
            ) : (
              <div className="flex items-center justify-center w-24 h-24 text-3xl font-bold text-gray-600 bg-gray-800 border-2 border-gray-700 rounded-full">
                {user.name?.charAt(0) || "?"}
              </div>
            )}
          </div>

          <h2 className="text-2xl font-semibold text-yellow-400">
            {user.name || "Utilisateur"}
          </h2>
          <p className="mt-1 text-sm text-gray-400">{user.email}</p>
          <p className="mt-2 text-xs italic text-gray-500">
            Compte créé via {user.provider || "inscription classique"}
          </p>

          {/* 📝 Infos éditables */}
          <div className="flex flex-col gap-3 mt-8 text-left">
            <label className="text-sm text-gray-400">Nom</label>
            <input
              type="text"
              defaultValue={user.name}
              onChange={(e) => (user.name = e.target.value)}
              className="px-3 py-2 text-sm text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-yellow-400"
            />

            <label className="text-sm text-gray-400">Email</label>
            <input
              type="email"
              defaultValue={user.email}
              onChange={(e) => (user.email = e.target.value)}
              className="px-3 py-2 text-sm text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-yellow-400"
            />
          </div>

          {/* 🎯 Boutons d’action */}
          <div className="flex flex-col gap-3 mt-8">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-black bg-yellow-400 rounded-full hover:bg-yellow-500"
            >
              <Save size={16} />
              Enregistrer les modifications
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDeleteAccount}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-400 border border-red-600 rounded-full hover:bg-red-600/20"
            >
              <Trash2 size={16} />
              Supprimer mon compte
            </motion.button>
          </div>
        </motion.div>

        <p className="mt-10 text-sm text-center text-gray-500">
          Mets à jour tes informations personnelles ou supprime ton compte.
        </p>
      </div>
    </PageWrapper>
  );
};

export default UserAccount;