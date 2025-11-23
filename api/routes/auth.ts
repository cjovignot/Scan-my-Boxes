import { Router, Response, Request } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { authLimiter } from "../middlewares/authLimiter";
import { checkAuth } from "../middlewares/checkAuth";
import { findUserByEmail, createUser } from "../controllers/userController";
import { safeUser } from "../utils/safeUser";
import { OAuth2Client } from "google-auth-library";

const router = Router();

// ============================================================
// 🍪 Générateur de token HTTP-only
// ============================================================
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
    secure: true, // toujours true en prod
    sameSite: "none", // <- important pour cross-site
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

// ============================================================
// 🟦 SIGNUP
// ============================================================
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

router.post("/signup", authLimiter, async (req, res) => {
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
    console.error("Signup error:", err);
    res
      .status(400)
      .json({ message: err.message || "Impossible de créer le compte" });
  }
});

// ============================================================
// 🟦 LOGIN
// ============================================================
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/login", authLimiter, async (req, res) => {
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
    res
      .status(400)
      .json({ message: err.message || "Impossible de se connecter" });
  }
});

// ============================================================
// 🟦 GOOGLE LOGIN
// ============================================================
const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post("/google-login", async (req, res) => {
  const idToken = req.body.token || req.body.credential;
  if (!idToken) return res.status(400).json({ message: "Token Google requis" });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email)
      return res.status(400).json({ message: "Email manquant" });

    const { email, name, picture } = payload;

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

    // 🔹 Définit le cookie pour auth/me
    sendTokenCookie(res, user);

    res.json({ message: "Connexion Google réussie", user: safeUser(user) });
  } catch (err: any) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Erreur Google login" });
  }
});

// ============================================================
// 🟦 LOGOUT
// ============================================================
router.post("/logout", (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });

  res.json({ message: "Déconnecté" });
});

// ============================================================
// 🟦 ME (current user)
// ============================================================
router.get("/me", checkAuth, async (req: any, res) => {
  const user = await findUserByEmail(req.user.email);
  res.json({ user: safeUser(user) });
});

// ============================================================
// 🟦 Optionnel : OAuth 2 redirect / callback
// ============================================================
router.get("/google-redirect", (req, res) => {
  const scope = ["openid", "email", "profile"].join(" ");
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    access_type: "offline",
    prompt: "select_account",
    scope,
    state: req.query.source === "pwa" ? "pwa" : "web",
  });

  res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
});

router.get("/google-callback", async (req, res) => {
  const code = req.query.code as string;
  const state = req.query.state as string;
  if (!code) return res.status(400).send("Code OAuth manquant");

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.id_token) throw new Error("Aucun id_token Google reçu");

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) return res.status(400).send("Email manquant");

    let user = await findUserByEmail(payload.email);
    if (!user) {
      user = await createUser({
        name: payload.name ?? "Utilisateur Google",
        email: payload.email,
        picture: payload.picture ?? "",
        provider: "google",
        role: "user",
      });
    }

    // 🔹 Définit le cookie HTTP-only pour auth/me
    sendTokenCookie(res, user);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    if (state === "pwa") {
      // Redirige avec un param facultatif pour que le frontend PWA sache que login OK
      res.redirect(`${frontendUrl}/auth/success?login=pwa`);
    } else {
      res.redirect(`${frontendUrl}/auth/success`);
    }
  } catch (err) {
    console.error("Google callback error:", err);
    res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
  }
});

export default router;
