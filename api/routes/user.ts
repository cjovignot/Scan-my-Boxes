// api/routes/user.ts
import { AuthRequest } from "../src/types/express-request";

import { Router } from "express";
import { checkAuth } from "../middlewares/checkAuth";
import { checkAdmin } from "../middlewares/checkAdmin";
import { User } from "../models/User";
import {
  createUser,
  findAllUsers,
  findUserById,
  updateUserById,
  deleteUserById,
} from "../controllers/userController";
import { safeUser } from "../utils/safeUser";

const router = Router();

// ------------------------
// GET — Tous les utilisateurs (admin seulement)
// ------------------------
router.get("/", checkAuth, checkAdmin, async (_req, res) => {
  try {
    const users = await findAllUsers();
    res.json(users.map(safeUser));
  } catch (error) {
    console.error("Erreur récupération utilisateurs :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ------------------------
// GET — Un utilisateur par son ID
// ------------------------
router.get("/:id", checkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ------------------------
// POST — Création d’un utilisateur (admin)
// ------------------------
router.post("/", checkAuth, checkAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Champs requis manquants." });
    }

    const user = await createUser({
      name,
      email,
      password,
      role: role || "user",
    });

    res.status(201).json({
      message: "Utilisateur créé par admin",
      user: safeUser(user),
    });
  } catch (error) {
    console.error("Erreur création utilisateur admin:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ------------------------
// PATCH — Mise à jour d’un utilisateur
// ------------------------
router.patch("/:id", checkAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Hachage mot de passe si fourni
    if (updates.password && updates.password.trim() !== "") {
      updates.password = updates.password;
    }

    // Whitelist des champs autorisés
    const allowedFields = [
      "name",
      "email",
      "picture",
      "provider",
      "password",
      "printSettings",
    ];
    const allowedUpdates: any = {};
    allowedFields.forEach((key) => {
      if (updates[key] !== undefined) allowedUpdates[key] = updates[key];
    });

    // Modification du rôle autorisée uniquement pour admin
    if (updates.role && req.user!.role === "admin") {
      allowedUpdates.role = updates.role;
    }

    const userToUpdate = await findUserById(id);
    if (!userToUpdate) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    // Vérification des droits : admin ou owner
    if (req.user!.role !== "admin" && req.user!._id !== id) {
      return res.status(403).json({ error: "Accès refusé." });
    }

    const updatedUser = await updateUserById(id, allowedUpdates);

    res.json({
      message: "Utilisateur mis à jour",
      user: safeUser(updatedUser!),
    });
  } catch (error) {
    console.error("Erreur mise à jour utilisateur:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ------------------------
// DELETE — Suppression d’un utilisateur
// ------------------------
router.delete("/:id", checkAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userToDelete = await findUserById(id);

    if (!userToDelete) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    // Vérification des droits : admin ou owner
    if (req.user!.role !== "admin" && req.user!._id !== id) {
      return res.status(403).json({ error: "Accès refusé." });
    }

    await deleteUserById(id);
    res.json({ message: "Utilisateur supprimé" });
  } catch (error) {
    console.error("Erreur suppression utilisateur:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

export default router;
