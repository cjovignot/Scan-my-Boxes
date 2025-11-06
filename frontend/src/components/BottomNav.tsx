import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, User, ScanQrCode, KeyRound } from "lucide-react";

const BottomNav = () => {
  const navItemsLeft = [
    { to: "/", icon: <Home size={22} strokeWidth={0.75} />, label: "Accueil" },
    {
      to: "/profile",
      icon: <User size={22} strokeWidth={0.75} />,
      label: "Profil",
    }
  ];

  const navItemsRight = [
    {
      to: "/login",
      icon: <KeyRound size={22} strokeWidth={0.75} />,
      label: "Connexion",
    {
      to: "/register",
      icon: <KeyRound size={22} strokeWidth={0.75} />,
      label: "Inscription",
    },
  ];

  const handleFabClick = () => alert("🚀 Action rapide !");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800 shadow-lg md:hidden">
      <div className="relative flex items-center justify-between py-3">
        {/* Bloc gauche */}
        <div className="flex flex-1 justify-evenly">
          {navItemsLeft.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {({ isActive }) => (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                    isActive ? "text-yellow-400" : "text-gray-400"
                  }`}
                >
                  {item.icon}
                  <span className="text-[11px] font-light">{item.label}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>

        {/* FAB (centré au-dessus de la nav) */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          onClick={handleFabClick}
          className="absolute p-3 text-white -translate-x-1/2 bg-black border border-gray-700 rounded-full shadow-lg left-1/2 -top-8"
        >
          <ScanQrCode size={32} />
        </motion.button>

        {/* Bloc droit */}
        <div className="flex flex-1 justify-evenly">
          {navItemsRight.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {({ isActive }) => (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                    isActive ? "text-yellow-400" : "text-gray-400"
                  }`}
                >
                  {item.icon}
                  <span className="text-[11px] font-light">{item.label}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
