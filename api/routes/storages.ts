import { Router } from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "../utils/db";
import {
  createStorage,
  findAllStorages,
  findStorageById,
  updateStorageById,
  deleteStorageById,
} from "../controllers/storageController";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const router = Router();

// ✅ Connexion MongoDB
router.use(async (_req, _res, next) => {
  await connectDB();
  next();
});

// ===================================
// 🔹 GET - Tous les entrepôts (optionnellement par ownerId)
// ===================================
router.get("/", async (req, res) => {
  try {
    const { ownerId } = req.query;
    const storages = await findAllStorages(ownerId as string | undefined);
    res.json(storages);
  } catch (error) {
    console.error("❌ Erreur récupération entrepôts :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ===================================
// 🔹 GET - Un entrepôt par ID
// ===================================
router.get("/:id", async (req, res) => {
  try {
    const storage = await findStorageById(req.params.id);
    if (!storage) {
      return res.status(404).json({ error: "Entrepôt introuvable." });
    }

    res.json(storage);
  } catch (error) {
    console.error("❌ Erreur récupération entrepôt :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ===================================
// 🔹 POST - Création d’un entrepôt
// ===================================
router.post("/", async (req, res) => {
  try {
    const { name, address, ownerId } = req.body;
    if (!name || !ownerId) {
      return res.status(400).json({ error: "Nom et ownerId requis." });
    }

    const storage = await createStorage({ name, address, ownerId });
    res.status(201).json({ message: "✅ Entrepôt créé", storage });
  } catch (error) {
    console.error("Erreur création entrepôt :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ===================================
// 🔹 PATCH - Mise à jour d’un entrepôt
// ===================================
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedStorage = await updateStorageById(id, updates);
    if (!updatedStorage) {
      return res.status(404).json({ error: "Entrepôt introuvable." });
    }

    res.json({ message: "✅ Entrepôt mis à jour", storage: updatedStorage });
  } catch (error) {
    console.error("Erreur mise à jour entrepôt :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ===================================
// 🔹 DELETE - Suppression d’un entrepôt
// ===================================
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await deleteStorageById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Entrepôt introuvable." });
    }

    res.json({ message: "🗑️ Entrepôt supprimé." });
  } catch (error) {
    console.error("Erreur suppression entrepôt :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

export default router;
