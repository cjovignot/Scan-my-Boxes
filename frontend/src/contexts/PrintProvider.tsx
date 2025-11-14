import { useState } from "react";
import { PrintContext } from "./PrintContext";

export const PrintProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedBoxes, setSelectedBoxes] = useState<string[]>([]);

  const toggleBox = (id: string) => {
    setSelectedBoxes((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedBoxes([]);

  return (
    <PrintContext.Provider value={{ selectedBoxes, toggleBox, clearSelection }}>
      {children}
    </PrintContext.Provider>
  );
};
