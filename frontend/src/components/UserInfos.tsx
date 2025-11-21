// frontend/src/components/UserInfos.tsx
import { useState, useMemo } from "react";
import { useApi } from "../hooks/useApi";
import { useApiMutation } from "../hooks/useApiMutation";
import { EditUserModal } from "./EditUserModal";
import { useAuth } from "../contexts/useAuth";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  provider?: string;
  picture?: string;
  createdAt?: string;
}

const UserInfos = () => {
  const { user: currentUser, setUser } = useAuth(); // 🔹 Contexte Auth

  const { data: users, loading, error, refetch } = useApi<User[]>("/api/user");

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ============================
  // 🔥 Mutation : suppression user
  // ============================
  const { mutate: deleteUser } = useApiMutation<{ message: string }, undefined>(
    "/api/user",
    "DELETE",
    {
      onSuccess: () => {
        setDeletingId(null);
        refetch();
        // Si l'utilisateur courant a été supprimé, logout
        if (currentUser && currentUser._id === selectedUserId) {
          setUser(null);
          window.location.href = "/login";
        }
      },
      onError: () => {
        alert("❌ Erreur lors de la suppression.");
        setDeletingId(null);
      },
    }
  );

  const handleEdit = (id: string) => setSelectedUserId(id);
  const closeModal = () => setSelectedUserId(null);

  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ Es-tu sûr de vouloir supprimer cet utilisateur ?")) return;

    setDeletingId(id);

    try {
      await deleteUser(undefined, { url: `/api/user/${id}` });
    } catch (err) {
      console.error("Erreur suppression utilisateur :", err);
      setDeletingId(null);
    }
  };

  // ============================
  // 🔍 Filtrage performant
  // ============================
  const filteredUsers = useMemo(() => {
    const t = search.toLowerCase();
    return (
      users?.filter(
        (u) =>
          u.email.toLowerCase().includes(t) ||
          u.name.toLowerCase().includes(t) ||
          u.role.toLowerCase().includes(t)
      ) ?? []
    );
  }, [users, search]);

  return (
    <div className="w-full max-w-md p-4 border border-gray-800 shadow-lg bg-gray-950 rounded-2xl">
      <h2 className="mb-4 text-lg font-semibold text-yellow-400">
        👥 Liste des utilisateurs
      </h2>

      {/* 🔍 Barre de recherche */}
      <input
        type="text"
        placeholder="Rechercher par email, nom ou rôle..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 mb-4 text-sm text-white bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-400"
      />

      {loading && <p className="text-center text-gray-400">⏳ Chargement...</p>}
      {error && <p className="text-center text-red-400">❌ {error}</p>}

      {!loading && filteredUsers.length === 0 && (
        <p className="text-center text-gray-500">Aucun utilisateur trouvé.</p>
      )}

      {filteredUsers.length > 0 && (
        <ul className="divide-y divide-gray-800">
          {filteredUsers.map((user) => (
            <li
              key={user._id}
              className="flex items-center justify-between py-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-yellow-400">
                  {user.name}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                <p className="mt-1 text-xs text-blue-400">
                  Rôle : <span className="text-gray-300">{user.role}</span>
                </p>
                {user.provider && (
                  <p className="text-[10px] text-gray-500">
                    Provider : {user.provider}
                  </p>
                )}
                {user.createdAt && (
                  <p className="mt-1 text-[10px] text-gray-500">
                    Créé le{" "}
                    {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {/* bouton modifier */}
                <button
                  onClick={() => handleEdit(user._id)}
                  className="px-3 py-1 text-xs text-black bg-yellow-500 rounded hover:bg-yellow-400"
                >
                  Modifier
                </button>

                {/* bouton supprimer */}
                <button
                  onClick={() => handleDelete(user._id)}
                  disabled={deletingId === user._id}
                  className={`px-3 py-1 text-xs text-white rounded ${
                    deletingId === user._id
                      ? "bg-red-800 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-500"
                  }`}
                >
                  {deletingId === user._id ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal d'édition */}
      <EditUserModal
        userId={selectedUserId}
        isOpen={!!selectedUserId}
        onClose={closeModal}
        onSuccess={refetch} // 🔹 onSuccess peut rester pour rafraîchir la liste
      />
    </div>
  );
};

export default UserInfos;
