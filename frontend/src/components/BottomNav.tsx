import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, User, ScanQrCode } from "lucide-react";

const BottomNav = () => {
  const location = useLocation(); // 👈 On récupère la route active
  const isHome = location.pathname === "/"; // Vérifie si on est sur "/"

  const navItems = [
    { to: "/", icon: <Home size={22} strokeWidth={0.75} />, label: "Accueil" },
    {
      to: "/profile",
      icon: <User size={22} strokeWidth={0.75} />,
      label: "Profil",
    },
  ];

  const handleFabClick = () => {
    // 👉 Action rapide (ouvre un modal, redirige, etc.)
    alert("🚀 Action rapide !");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-auto py-4 bg-gray-800 shadow-md md:hidden">
      {/* Icônes de gauche */}
      {navItems.slice(0, 2).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs transition-colors !font-thin ${
              isActive ? "!text-yellow-400" : "!text-gray-400"
            }`
          }
        >
          {({ isActive }) => (
            <motion.div
              // whileTap={{ scale: 0.85 }}
              animate={{ scale: isActive ? 1.2 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="flex items-center"
            >
              {item.icon}
              {isActive && (
                <span className="text-[10px] ml-2">{item.label}</span>
              )}
            </motion.div>
          )}
        </NavLink>
      ))}

      {
        <motion.button
          whileTap={{ scale: 0.9 }}
          // initial={{ scale: 0, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          onClick={handleFabClick}
          className="fixed !p-3  h-auto w-auto text-white bottom-7 !bg-gray-900 !rounded-full"
        >
          <ScanQrCode size={32} />
        </motion.button>
      }

      {/* Icônes de droite */}
      {navItems.slice(2).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs transition-colors ${
              isActive ? "text-blue-600" : "text-gray-500"
            }`
          }
        >
          {({ isActive }) => (
            <motion.div
              whileTap={{ scale: 0.85 }}
              animate={{ scale: isActive ? 1.2 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="flex flex-col items-center"
            >
              {item.icon}
              <span className="text-[10px] mt-1">{item.label}</span>
            </motion.div>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
