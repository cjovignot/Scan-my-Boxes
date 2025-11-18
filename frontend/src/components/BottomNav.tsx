import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChartNoAxesCombined,
  User,
  ScanQrCode,
  KeyRound,
  Boxes,
  Box,
  Warehouse
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const BottomNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFabClick = () => {
    navigate("/scan");
  };

  const navItemsLeft = [
    {
      to: "/boxes",
      icon: <Box size={22} strokeWidth={0.75} />,
      label: "Boîtes",
    },
    {
      to: "/storages",
      icon: <Warehouse size={22} strokeWidth={0.75} />,
      label: "Entrepôts",
    },
  ];

  let navItemsRight = [];

  if (!user) {
    navItemsRight = [
      {
        to: "/login",
        icon: <KeyRound size={22} strokeWidth={0.75} />,
        label: "Connexion",
      },
    ];
  } else {
    navItemsRight = [
      {
        to: "/",
        icon: <ChartNoAxesCombined size={22} strokeWidth={0.75} />,
        label: "Stats",
      },
      {
        to: "/profile",
        icon: (
          <div className="relative">
            <User size={22} strokeWidth={0.75} />
            <span className="absolute top-0 right-0 block w-2 h-2 bg-green-500 rounded-full ring-2 ring-gray-900"></span>
          </div>
        ),
        label: "Profil",
      },
    ];
  }

  // function getRadius(size: number): number {
  //   return (10 / 57) * size;
  // }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 shadow-lg bg-gray-950 md:hidden">
      {/* FAB central
      <div className="flex items-center justify-center w-full min-h-screen bg-black">
        <motion.button
          whileTap={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          onClick={handleFabClick}
          style={{
            borderRadius: getRadius(200), // 👈 radius dynamique
          }}
          className="items-center p-3 text-yellow-400 shadow-lg border-5 border-yellow-400/70 bg-gray-950"
        >
          <ScanQrCode size={"192px"} />
        </motion.button>
      </div> */}
      <div className="relative flex items-center justify-between gap-10 py-3">
        {/* Bloc gauche */}
        <div className="flex flex-1 justify-evenly">
          {navItemsLeft.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {({ isActive }) => (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
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

        {/* FAB central */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          onClick={handleFabClick}
          className="absolute p-3 text-yellow-400 -translate-x-1/2 border-2 rounded-full shadow-lg border-yellow-400/70 bg-gray-950 -top-3 left-1/2"
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
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
