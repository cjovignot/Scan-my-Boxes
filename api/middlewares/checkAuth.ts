import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const checkAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant ou invalide" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      role: string;
    };

    req.user = decoded; // ✅ Attache les infos utilisateur
    next();
  } catch (err) {
    console.error("Erreur vérification JWT :", err);
    res.status(401).json({ message: "Token invalide ou expiré" });
  }
};
