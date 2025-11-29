import { useContext } from "react";
import { PrintContext } from "../contexts/PrintContext";

export const usePrint = () => {
  const ctx = useContext(PrintContext);
  if (!ctx) throw new Error("usePrint must be used inside <PrintProvider>");
  return ctx;
};
