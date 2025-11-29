import { Outlet } from "react-router-dom";
import BottomNav from "../components/Navigation/BottomNav";
import FloatingPrintButton from "../components/Print/FloatingPrintButton";

const MobileLayout = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Contenu scrollable */}
      <div className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </div>

      {/* Barre de navigation fixe */}
      <BottomNav />

      {/* FloatingPrintButton */}
      <FloatingPrintButton />
    </div>
  );
};

export default MobileLayout;
