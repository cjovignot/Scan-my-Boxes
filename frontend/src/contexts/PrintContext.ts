import { createContext } from "react";

export interface PrintContextType {
  selectedBoxes: string[];
  toggleBox: (id: string) => void;
  clearSelection: () => void;
}

export const PrintContext = createContext<PrintContextType | undefined>(
  undefined
);
