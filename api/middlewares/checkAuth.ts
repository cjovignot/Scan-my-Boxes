import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "../src/types/user";
import { AuthRequest } from "../types/express-request";

export const checkAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // 🔹 Lire le token depuis le cookie, pas depuis le header
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Non authentifié." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as IUser;

    req.user = {
      _id: decoded._id,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalide." });
  }
};
