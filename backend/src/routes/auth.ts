import { Router, Response, Request } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { checkAuth } from "../middlewares/checkAuth";
import { findUserByEmail, createUser } from "../controllers/userController";
import { safeUser } from "../utils/safeUser";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import { User } from "../models/user";

const router = Router();

// Patch du type Request pour req.user
declare module "express-serve-static-core" {
  interface Request {
    user?: any;
  }
}

// 🔹 Cookie generator
const sendTokenCookie = (res: Response, user: any) => {
  const token = jwt.sign(
    {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

// SIGNUP
const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = signupSchema.parse(req.body);

    const existing = await findUserByEmail(email);
    if (existing)
      return res.status(400).json({ message: "Email déjà utilisé" });

    const user = await createUser({
      name,
      email,
      password,
      provider: "local",
      role: "user",
    });

    sendTokenCookie(res, user);
    res.status(201).json({ message: "Utilisateur créé", user: safeUser(user) });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// LOGIN classique
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await findUserByEmail(email);

    if (!user || user.provider === "google") {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const isValid = await bcrypt.compare(password, user.password!);
    if (!isValid)
      return res.status(401).json({ message: "Identifiants invalides" });

    sendTokenCookie(res, user);
    res.json({ message: "Connexion réussie", user: safeUser(user) });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// GOOGLE LOGIN (popup PWA / navigateur classique)
const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID!);

router.post("/google-login", async (req, res) => {
  try {
    const { token, isPWA } = req.body; // 🔹 on reçoit isPWA
    if (!token)
      return res.status(400).json({ error: "Token Google manquant." });

    let id_token = token;

    if (isPWA) {
      // 🔹 PWA popup → token est le code → on échange code contre id_token
      const tokenRes = await axios.post(
        "https://oauth2.googleapis.com/token",
        new URLSearchParams({
          code: token,
          client_id: process.env.VITE_GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: "postmessage",
          grant_type: "authorization_code",
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      id_token = tokenRes.data.id_token;
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.VITE_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload)
      return res.status(400).json({ error: "Token Google invalide." });

    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name,
        googleId,
        avatar: picture,
        provider: "google",
      });
    }

    // 🔹 Cookie si navigateur classique
    if (!isPWA) sendTokenCookie(res, user);

    // 🔹 Token à renvoyer si PWA
    const pwaToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    return res.json({
      user: safeUser(user),
      token: isPWA ? pwaToken : undefined,
    });
  } catch (err) {
    console.error("❌ Google login error:", err);
    res.status(500).json({ error: "Erreur lors du login Google." });
  }
});

// LOGOUT
router.post("/logout", (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ message: "Déconnecté" });
});

// ME
router.get("/me", checkAuth, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });

  let userFull;
  if (req.user._id) {
    userFull = await User.findById(req.user._id);
  }

  return res.json({ user: userFull ? safeUser(userFull) : req.user });
});

export default router;
