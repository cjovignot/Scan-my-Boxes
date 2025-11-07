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


// ✅ GET - tous les utilisateurs
router.get("/", async (req, res) => {
  await connectDB();

  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("❌ Erreur récupération utilisateurs :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ✅ GET - un utilisateur par ID
router.get("/:id", async (req, res) => {
  await connectDB();

  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ error: "Utilisateur introuvable." });
    res.json(user);
  } catch (error) {
    console.error("❌ Erreur récupération user :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ✅ POST - création d'un utilisateur classique
router.post("/", async (req, res) => {
  await connectDB();

  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Champs requis manquants." });

    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hash });
    res.status(201).json({ message: "✅ Utilisateur créé", user: newUser });
  } catch (error) {
    console.error("Erreur création user:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ PATCH - modification d’un utilisateur
router.patch("/:id", async (req, res) => {
  await connectDB();

  try {
    const { name, email, password } = req.body;
    const updateData: any = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    res.json({ message: "✅ Utilisateur mis à jour", user: updatedUser });
  } catch (error) {
    console.error("Erreur mise à jour user:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ DELETE - suppression d’un utilisateur
router.delete("/:id", async (req, res) => {
  await connectDB();

  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    res.json({ message: "🗑️ Utilisateur supprimé." });
  } catch (error) {
    console.error("Erreur suppression user:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ✅ POST /api/user/google-login
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

export default router;
