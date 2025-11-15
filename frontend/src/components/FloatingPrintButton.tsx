import { usePrint } from "../hooks/usePrint";
import { Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FloatingPrintButton = () => {
  const { selectedBoxes } = usePrint();
  const navigate = useNavigate();

  if (selectedBoxes.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 200,
        pointerEvents: "none", // le container ignore les clics
      }}
    >
      <button
        onClick={() => navigate("/printgroup")}
        style={{ pointerEvents: "auto" }} // le bouton capte les clics
        className="flex items-center gap-2 px-4 py-2 font-semibold text-black transition-all bg-yellow-400 rounded-full shadow-xl  hover:bg-yellow-500"
      >
        <Printer size={18} />
        {selectedBoxes.length}
      </button>
    </div>
  );
};

export default FloatingPrintButton;
