import { Router } from "express";
import { User } from "../models/User";
import { connectDB } from "../utils/db";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import path from "path";

// ✅ Charge le .env correctement même en local
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const router = Router();

// ✅ Utilise le vrai client ID backend (pas celui du front)
const googleClientId = process.env.VITE_GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(googleClientId);


// ✅ POST /api/auth/google-login
router.post("/google-login", async (req, res) => {
  await connectDB();
  const { token } = req.body;

  try {
    if (!googleClientId) {
      console.error("❌ VITE_GOOGLE_CLIENT_ID manquant côté backend");
      return res.status(500).json({ error: "Configuration Google manquante." });
    }

    // ✅ Vérifie le token Google côté serveur
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ error: "Email Google non trouvé." });
    }

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      // ✅ Si l'utilisateur n'existe pas, on le crée sans mot de passe
      user = new User({
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        provider: "google",
        password: "-", // placeholder pour satisfaire le schéma
      });
      await user.save();
    } else {
      // ✅ Sinon, on met à jour les infos Google
      user.name = payload.name || user.name;
      user.picture = payload.picture || user.picture;
      user.provider = "google";
      await user.save();
    }

    res.json({
      success: true,
      user,
    });
  } catch (err: any) {
    console.error("❌ Erreur vérification Google:", err);
    res.status(401).json({ error: "Token Google invalide." });
  }
});