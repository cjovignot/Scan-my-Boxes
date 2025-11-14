import express from "express";
import { Box } from "../models/Box";
import { Types } from "mongoose";
import QRCode from "qrcode";
import cloudinary from "cloudinary";
import { updateStorageById } from "../controllers/storageController";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const router = express.Router();

/**
 * 🟢 GET /api/boxes
 * Liste toutes les boîtes (filtrables par ownerId ou storageId)
 */
router.get("/", async (req, res) => {
  try {
    const { ownerId, storageId, ids } = req.query;
    const filter: any = {};

    if (ownerId) {
      filter.ownerId = Types.ObjectId.isValid(ownerId as string)
        ? new Types.ObjectId(ownerId as string)
        : ownerId;
    }

    if (storageId) {
      filter.storageId = Types.ObjectId.isValid(storageId as string)
        ? new Types.ObjectId(storageId as string)
        : storageId;
    }

    // 🔹 Filtrer par ids si fourni
    if (ids) {
      const idsArray = (ids as string)
        .split(",")
        .filter(Types.ObjectId.isValid)
        .map((id) => new Types.ObjectId(id));
      filter._id = { $in: idsArray };
    }

    const boxes = await Box.find(filter).sort({ createdAt: -1 });
    res.json(boxes);
  } catch (err) {
    console.error("Erreur lors de la récupération des boîtes :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * 🟢 GET /api/boxes/:id
 * Récupère une boîte spécifique par ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "ID invalide" });

    const box = await Box.findById(id);
    if (!box) return res.status(404).json({ error: "Boîte introuvable" });

    res.json(box);
  } catch (err) {
    console.error("Erreur lors de la récupération de la boîte :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * 🟢 POST /api/boxes
 * Crée une nouvelle boîte
 */
router.post("/", async (req, res) => {
  try {
    const { ownerId, storageId, destination, content, dimensions, fragile } =
      req.body;

    // ownerId requis, storageId optionnel
    if (!ownerId) {
      return res.status(400).json({ error: "ownerId est requis" });
    }

    const ownerObjectId = Types.ObjectId.isValid(ownerId)
      ? new Types.ObjectId(ownerId)
      : ownerId;

    const storageObjectId =
      storageId && Types.ObjectId.isValid(storageId)
        ? new Types.ObjectId(storageId)
        : null;

    // Générer le numéro BOX-XXX
    const userBoxes = await Box.find({ ownerId: ownerObjectId }).sort({
      createdAt: 1,
    });
    const nextNumber = (userBoxes.length + 1).toString().padStart(3, "0");
    const boxNumber = `BOX-${nextNumber}`;

    const newBox = new Box({
      ownerId: ownerObjectId,
      storageId: storageObjectId || null,
      number: boxNumber,
      fragile: fragile || false,
      destination: destination || "Inconnu",
      content: content || [],
      dimensions: {
        width: dimensions?.width || 0,
        height: dimensions?.height || 0,
        depth: dimensions?.depth || 0,
      },
    });

    const savedBox = await newBox.save();

    // Ajouter la box dans l'entrepôt SEULEMENT si storageId fourni
    if (storageObjectId) {
      await updateStorageById(storageObjectId.toString(), {
        $addToSet: { boxes: savedBox._id },
      });
    }

    // Génération du QR code
    const boxURL = `${
      process.env.FRONTEND_URL || "https://scanmyboxes.app"
    }/box/${savedBox._id}`;

    const qrCodeDataURL = await QRCode.toDataURL(boxURL);

    const uploadResponse = await cloudinary.v2.uploader.upload(qrCodeDataURL, {
      folder: "scan-my-boxes/qrcodes",
      public_id: `qrcode_${savedBox._id}`,
      overwrite: true,
    });

    savedBox.qrcodeURL = uploadResponse.secure_url;
    await savedBox.save();

    res.status(201).json(savedBox);
  } catch (err) {
    console.error("Erreur création boîte :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * 🟡 PUT /api/boxes/:id
 * Met à jour une boîte existante
 */
router.put("/:id", async (req, res) => {
  try {
    const updatedBox = await Box.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedBox)
      return res.status(404).json({ error: "Boîte introuvable" });
    res.json(updatedBox);
  } catch (err) {
    console.error("Erreur mise à jour boîte :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * 🔴 DELETE /api/boxes/:id
 * Supprime une boîte et la retire de l’entrepôt associé
 */
router.delete("/:id", async (req, res) => {
  try {
    const box = await Box.findById(req.params.id);
    if (!box) return res.status(404).json({ error: "Boîte introuvable" });

    await Box.findByIdAndDelete(req.params.id);
    await updateStorageById(box.storageId.toString(), {
      $pull: { boxes: box._id },
    });

    res.json({ message: "Boîte supprimée et retirée de l’entrepôt" });
  } catch (err) {
    console.error("Erreur suppression boîte :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
