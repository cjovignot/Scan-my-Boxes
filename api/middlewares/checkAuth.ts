import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../../shared/types/express-request";

export const checkAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Non authentifié." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    req.user = {
      _id: decoded._id,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide." });
  }
};
