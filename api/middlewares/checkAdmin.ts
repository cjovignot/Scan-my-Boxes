import { Response, NextFunction } from "express";
import { AuthRequest } from "../src/types/express-request";

export const checkAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Non authentifié" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé : admin requis" });
  }

  next();
};
