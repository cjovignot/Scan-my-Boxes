import { useEffect } from "react";
import PageWrapper from "../components/PageWrapper";
import { motion } from "framer-motion";
import { LogOut, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

interface DashboardLink {
  label: string;
  path: string;
  role?: "admin";
}

const dashboardLinks: DashboardLink[] = [
  { label: "👥 Utilisateurs", path: "/admin/users", role: "admin" },
  { label: "👤 Mon compte", path: "/userAccount" },
  { label: "⚙️ Paramètres", path: "/settings" },
];

const Profile = () => {
  const { user, loading, logout } = useAuth()!;
  const navigate = useNavigate();

  // 🔹 Attendre que l'utilisateur soit chargé avant de naviguer
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  // 🔹 Affiche rien tant que l'auth n'est pas prêt
  if (loading || !user) return null;

  const getInitials = (name: string | undefined) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const visibleLinks = dashboardLinks.filter(
    (link) => !link.role || link.role === user.role
  );

  return (
    <PageWrapper>
      <div className="flex flex-col items-center px-6 py-10 text-white">
        {/* Carte Profil */}
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
              <div className="flex items-center justify-center w-24 h-24 text-3xl font-bold text-yellow-400 bg-gray-900 border-2 border-yellow-400 rounded-full shadow-md">
                {getInitials(user.name)}
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

          <div className="flex flex-col gap-3 mt-8">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-black bg-yellow-400 rounded-full hover:bg-yellow-500"
            >
              <LogOut size={16} />
              Se déconnecter
            </motion.button>
          </div>
        </motion.div>

        {/* Tableau de bord */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md mt-10 overflow-hidden bg-gray-900 border border-gray-800 shadow-lg rounded-2xl"
        >
          <h3 className="px-4 py-3 text-sm font-semibold text-gray-400 uppercase">
            ⚙️ Tableau de bord
          </h3>

          <ul className="divide-y divide-gray-800">
            {visibleLinks.map((link) => (
              <li key={link.path}>
                <button
                  onClick={() => navigate(link.path)}
                  className="flex items-center justify-between w-full px-4 py-4 text-left transition-colors hover:bg-gray-800"
                >
                  <span className="text-gray-200">{link.label}</span>
                  <ChevronRight size={18} className="text-gray-500" />
                </button>
              </li>
            ))}
          </ul>
        </motion.div>

        <p className="mt-10 text-sm text-center text-gray-500">
          Gère ton profil et tes informations personnelles.
        </p>
      </div>
    </PageWrapper>
  );
};

export default Profile;
