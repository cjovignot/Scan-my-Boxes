import { Router } from "express";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "../utils/db";
import {
  createUser,
  findAllUsers,
  findUserById,
  findUserByEmail,
  updateUserById,
  deleteUserById,
} from "../controllers/userController";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const router = Router();

// ✅ Connexion MongoDB
router.use(async (_req, _res, next) => {
  await connectDB();
  next();
});

// ===============================
// 🔹 GET - Tous les utilisateurs
// ===============================
router.get("/", async (_req, res) => {
  try {
    const users = await findAllUsers();
    res.json(users);
  } catch (error) {
    console.error("❌ Erreur récupération utilisateurs :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ===================================
// 🔹 GET - Récupération d’un utilisateur par email
// ===================================
router.get("/by-email/:email", async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ error: "Email manquant." });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    res.json({ user });
  } catch (error) {
    console.error("Erreur récupération user par email:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ======================================
// 🔹 GET - Un utilisateur par ID
// ======================================
router.get("/:id", async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ Erreur récupération user :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ========================================
// 🔹 POST - Création d’un utilisateur local
// ========================================
router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Champs requis manquants." });

    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email, password: hashed });
    res.status(201).json({ message: "✅ Utilisateur créé", user });
  } catch (error) {
    console.error("Erreur création user:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ===================================
// 🔹 PATCH - Mise à jour d’un utilisateur par ID
// ===================================
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Hachage du mot de passe si nécessaire
    if (updates.password && updates.password.trim() !== "") {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // On n'autorise maintenant que certains champs + printSettings
    const allowedUpdates: any = {};
    const fields = [
  "name",
  "email",
  "role",
  "picture",
  "provider",
  "password",
  "printSettings",
];
    fields.forEach((key) => {
      if (updates[key] !== undefined) allowedUpdates[key] = updates[key];
    });

    const updatedUser = await updateUserById(id, allowedUpdates);
    if (!updatedUser)
      return res.status(404).json({ error: "Utilisateur introuvable." });

    res.json({ message: "✅ Utilisateur mis à jour", user: updatedUser });
  } catch (error) {
    console.error("Erreur mise à jour user:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ===================================
// 🔹 DELETE - Suppression d’un utilisateur par ID
// ===================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteUserById(id);
    if (!deleted)
      return res.status(404).json({ error: "Utilisateur introuvable." });

    res.json({ message: "🗑️ Utilisateur supprimé." });
  } catch (error) {
    console.error("Erreur suppression user:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

export default router;
