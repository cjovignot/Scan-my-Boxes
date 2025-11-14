import { usePrint } from "../hooks/usePrint";
import { Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FloatingPrintButton = () => {
  const { selectedBoxes } = usePrint();
  console.log(selectedBoxes);
  const navigate = useNavigate();

  if (selectedBoxes.length === 0) return null; // 🚀 n'affiche rien si vide

  return (
    <button
      onClick={() => navigate("/printgroup")}
      className="
        fixed top-4 right-4 z-[200]
        bg-yellow-400 text-black shadow-xl rounded-full
        px-4 py-2 flex items-center gap-2 font-semibold
        hover:bg-yellow-500 transition-all
      "
    >
      <Printer size={18} />
      {selectedBoxes.length}
    </button>
  );
};

export default FloatingPrintButton;
