import {
  Router,
  Response,
  NextFunction,
  Request as ExpressRequest,
} from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { authLimiter } from "../middlewares/authLimiter";
import { checkAuth } from "../middlewares/checkAuth";
import { findUserByEmail, createUser } from "../controllers/userController";
import { safeUser } from "../utils/safeUser";
import { IUser } from "../src/types/user"; // ⚡ ton type
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User";

// Type pour req avec user
type AuthRequest = ExpressRequest & { user?: IUser };

const router = Router();

// ========================
// 🔹 Générateur de token et cookie
// ========================
const sendTokenCookie = (res: any, user: any) => {
  const token = jwt.sign(
    {
      _id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

// ------------------------
// ✅ Public Signup
// ------------------------
const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Doit contenir au moins un chiffre")
    .regex(/[^A-Za-z0-9]/, "Doit contenir un symbole"),
});

router.post("/signup", authLimiter, async (req, res) => {
  try {
    const { name, email, password } = signupSchema.parse(req.body);

    const existing = await findUserByEmail(email);
    if (existing)
      return res.status(400).json({ message: "Email déjà utilisé" });

    const user = await createUser({
      name,
      email,
      password: password,
      provider: "local",
      role: "user",
    });

    // 🔹 Génère token et cookie automatiquement après signup
    sendTokenCookie(res, user);

    res
      .status(201)
      .json({ message: "✅ Utilisateur créé", user: safeUser(user) });
  } catch (err: any) {
    console.error("Signup error:", err);
    res
      .status(400)
      .json({ message: err.message || "Impossible de créer le compte" });
  }
});

// ------------------------
// ✅ Public Login
// ------------------------
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// ------------------------
// ✅ Public Login
// ------------------------
router.post("/login", authLimiter, async (req, res) => {
  try {
    // 1️⃣ Valider les données
    const { email, password } = loginSchema.parse(req.body);

    // console.log("=== LOGIN REQUEST ===");
    // console.log("Email reçu :", email);
    // console.log("Password reçu :", password, "| length:", password.length);
    // console.log("Raw body :", req.body);

    // 2️⃣ Trouver le user
    const user = await findUserByEmail(email);

    if (!user) {
      // console.log("Utilisateur introuvable !");
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    if (user.provider === "google") {
      // console.log("Tentative de login classique avec compte Google !");
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // console.log(
    //   "Password en DB :",
    //   user.password,
    //   "| length:",
    //   user.password?.length
    // );

    // 3️⃣ Vérifier le mot de passe
    const isValid = await bcrypt.compare(password, user.password!);
    // console.log("Résultat bcrypt.compare :", isValid);

    if (!isValid) {
      // console.log("❌ Mot de passe incorrect !");
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // 4️⃣ Envoi du token cookie
    sendTokenCookie(res, user);
    // console.log("✅ Connexion réussie pour :", email);

    return res.json({
      message: "Connexion réussie",
      user: safeUser(user),
    });
  } catch (err: any) {
    // console.error("Login error:", err);
    return res
      .status(400)
      .json({ message: err.message || "Impossible de se connecter" });
  }
});

// ------------------------
// ✅ GOOGLE Login
// ------------------------
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google-login", async (req, res) => {
  const token = req.body.token || req.body.credential; // <- support GSI
  if (!token) return res.status(400).json({ message: "Token Google requis" });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ message: "Token invalide" });

    const email = payload.email;
    if (!email)
      return res.status(400).json({ message: "Email non fourni par Google" });

    const { name, picture } = payload;

    let user = await findUserByEmail(email);

    if (!user) {
      user = await createUser({
        name,
        email,
        picture,
        provider: "google",
        role: "user",
      });
    }

    const jwtToken = jwt.sign(
      {
        _id: user._id as string,
        role: user.role,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Connexion Google réussie",
      user: safeUser(user),
      token: jwtToken,
    });
  } catch (err) {
    console.error("Erreur Google login :", err);
    return res
      .status(500)
      .json({ message: "Impossible de se connecter via Google" });
  }
});

// ------------------------
// ✅ Logout
// ------------------------
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Déconnecté" });
});

// ------------------------
// ✅ Get current user
// ------------------------
router.get("/me", checkAuth, async (req: AuthRequest, res: Response) => {
  const user = await findUserByEmail(req.user!.email);
  res.json({ user: safeUser(user) });
});

export default router;
