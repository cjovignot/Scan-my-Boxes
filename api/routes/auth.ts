// ============================
// 🔐 routes/auth.ts
// ============================

import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import path from "path";
import {
  findUserByEmail,
  createUser,
  updateUserByEmail,
} from "../controllers/userController";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const router = Router();

// ✅ Client Google configuré avec l’ID côté backend
const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID!;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ============================
// 🔹 POST /api/auth/google-login
// ============================
router.post("/google-login", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Token manquant." });
  }

  try {
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: "Configuration Google manquante." });
    }

    // ✅ Vérifie le token Google côté serveur
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(400).json({ error: "Email Google introuvable." });
    }

    // ⚙️ Valeurs sécurisées
    const email = payload.email;
    const name = payload.name ?? "Utilisateur Google";
    const picture = payload.picture ?? "";

    // 🔎 Recherche utilisateur existant
    let user = await findUserByEmail(email);

    if (!user) {
      console.log(`🆕 Création nouvel utilisateur Google : ${email}`);
      user = await createUser({
        name,
        email,
        picture,
        provider: "google",
        password: "-",
        role: "user", // rôle par défaut
      });
    } else {
      // ✅ Mise à jour sans écraser le rôle existant
      user = await updateUserByEmail(email, {
        name,
        picture,
        provider: "google",
      });
    }

    // 🔁 Réponse complète au front
    res.status(200).json({
      success: true,
      user: {
        _id: user!._id,
        name: user!.name,
        email: user!.email,
        picture: user!.picture,
        provider: user!.provider,
        role: user!.role, // 🟢 gardera bien "admin" si défini dans MongoDB
        createdAt: user!.createdAt,
        updatedAt: user!.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("❌ Erreur Google Login :", error);
    res.status(400).json({
      error: "Erreur d'authentification Google",
      details: error.message,
    });
  }
});

// ============================
// 🔹 GET /api/auth/google-redirect
// ============================
router.get("/google-redirect", (req, res) => {
  const redirect_uri =
    process.env.GOOGLE_REDIRECT_URI ??
    "https://scan-my-boxes.vercel.app/api/auth/google-callback";

  const scope = ["openid", "email", "profile"].join(" ");

  const params = new URLSearchParams({
    client_id: process.env.VITE_GOOGLE_CLIENT_ID!,
    redirect_uri,
    response_type: "code",
    access_type: "offline",
    prompt: "select_account",
    scope,
  });

  res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
});

// ============================
// 🔹 GET /api/auth/google-callback
// ============================
router.get("/google-callback", async (req, res) => {
  const code = req.query.code as string;

  if (!code) return res.status(400).json({ error: "Code manquant." });

  try {
    // Échange le code contre un token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.VITE_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.id_token) throw new Error("Pas d'id_token reçu de Google");

    // Vérifie le token côté serveur
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.VITE_GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(400).json({ error: "Email manquant dans le token." });
    }

    // ⚙️ Valeurs sécurisées
    const email = payload.email;
    const name = payload.name ?? "Utilisateur Google";
    const picture = payload.picture ?? "";

    let user = await findUserByEmail(email);
    if (!user) {
      user = await createUser({
        name,
        email,
        picture,
        provider: "google",
        password: "-",
      });
    }

    const frontendUrl =
      process.env.FRONTEND_URL || "https://ton-domaine.vercel.app";

    // 🔁 Redirige vers le frontend
    res.redirect(
      `${frontendUrl}/auth/success?email=${encodeURIComponent(email)}`
    );
  } catch (err: any) {
    console.error("❌ Erreur callback Google:", err);
    res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
  }
});

export default router;
