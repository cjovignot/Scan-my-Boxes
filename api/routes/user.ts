import { Router } from "express";
import { User } from "../models/User";
import { connectDB } from "../utils/db";
import bcrypt from "bcryptjs";

const router = Router();

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

    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

    res.json(user);
  } catch (error) {
    console.error("❌ Erreur récupération user :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ✅ POST - création d'un utilisateur
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

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    res.json({ message: "✅ Utilisateur mis à jour", user: updatedUser });
  } catch (error) {
    console.error("Erreur mise à jour user:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;