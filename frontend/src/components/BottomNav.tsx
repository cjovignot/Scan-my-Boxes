import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, User, ScanQrCode } from "lucide-react";

const BottomNav = () => {
  const navItems = [
    { to: "/", icon: <Home size={22} strokeWidth={0.75} />, label: "Accueil" },
    { to: "/profile", icon: <User size={22} strokeWidth={0.75} />, label: "Profil" },
  ];

  const handleFabClick = () => alert("🚀 Action rapide !");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-auto py-4 bg-gray-800 shadow-md md:hidden">

      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to}>
          {({ isActive }) => (
            <motion.div
              layout
              className="flex items-center px-3 py-2"
              animate={{
                backgroundColor: isActive ? "rgba(156,163,175,1)" : "rgba(0,0,0,0)",
                borderRadius: "9999px",
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >

              {/* Icône (reste fixe à gauche) */}
              <motion.div
                layout
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {item.icon}
              </motion.div>

              {/* Conteneur du texte avec largeur animée */}
              <motion.div
                layout
                animate={{
                  width: isActive ? "auto" : 0,
                  marginLeft: isActive ? 6 : 0,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="overflow-hidden" // ✨ Révélation de gauche → droite
              >
                <span className="text-[11px] font-light whitespace-nowrap">
                  {item.label}
                </span>
              </motion.div>
            </motion.div>
          )}
        </NavLink>
      ))}

      {/* FAB Centre */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        onClick={handleFabClick}
        className="fixed bottom-7 !p-3 text-white !bg-gray-900 !rounded-full"
      >
        <ScanQrCode size={32} />
      </motion.button>
    </nav>
  );
};

export default BottomNav;