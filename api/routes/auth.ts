// ============================
// 🔐 routes/auth.ts
// ============================

import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { connectDB } from "../utils/db";
import { User } from "../models/User";
import dotenv from "dotenv";
import path from "path";

// ✅ Charge les variables d’environnement locales si besoin
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const router = Router();

// ✅ Client Google configuré avec l’ID côté backend
const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ============================
// 🔹 POST /api/auth/google-login
// ============================
router.post("/google-login", async (req, res) => {
  await connectDB();

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Token manquant." });
  }

  try {
    if (!GOOGLE_CLIENT_ID) {
      console.error("❌ GOOGLE_CLIENT_ID non défini dans le backend");
      return res.status(500).json({ error: "Configuration Google manquante." });
    }

    // ✅ Vérifie la validité du token Google côté serveur
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ error: "Email Google introuvable." });
    }

    const { email, name, picture } = payload;

    // ✅ Recherche l'utilisateur ou création si nouveau
    let user = await User.findOne({ email });
    if (!user) {
      console.log(`🆕 Nouvel utilisateur Google : ${email}`);

      user = await User.create({
        name,
        email,
        picture,
        provider: "google",
        password: "-", // placeholder pour satisfaire le schéma Mongoose
      });
    } else {
      // ✅ Mise à jour des infos existantes
      user.name = name || user.name;
      user.picture = picture || user.picture;
      user.provider = "google";
      await user.save();
    }

    console.log(`✅ Connexion Google réussie pour : ${email}`);

    res.status(200).json({ success: true, user });
  } catch (error: any) {
    console.error("❌ Erreur Google Login :", error);
    res
      .status(400)
      .json({
        error: "Erreur d'authentification Google",
        details: error.message,
      });
  }
});

export default router;
