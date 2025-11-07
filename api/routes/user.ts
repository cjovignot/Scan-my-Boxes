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

export default router;
