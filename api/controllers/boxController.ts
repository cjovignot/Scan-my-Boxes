import { Request, Response } from "express";
import { Box } from "../models/Box";

export const createBox = async (req: Request, res: Response) => {
  try {
    const { ownerId, storageId, destination, content, dimensions } = req.body;

    if (!ownerId) {
      return res.status(400).json({ message: "ownerId est requis." });
    }

    // 🔍 Trouver la dernière boîte de cet utilisateur
    const lastBox = await Box.findOne({ ownerId })
      .sort({ createdAt: -1 })
      .select("number")
      .lean();

    // 🔢 Générer un nouveau numéro
    let nextNumber = "BOX-001";
    if (lastBox?.number) {
      const num = parseInt(lastBox.number.replace("BOX-", ""), 10) + 1;
      nextNumber = `BOX-${num.toString().padStart(3, "0")}`;
    }

    // 🧱 Créer la boîte (storageId devient optionnel)
    const newBox = new Box({
      ownerId,
      storageId: storageId || null, // 👈 Optionnel
      number: nextNumber,
      destination: destination || "Inconnu",
      content: content || [],
      dimensions,
    });

    await newBox.save();
    res.status(201).json(newBox);
  } catch (error) {
    console.error("Erreur création boîte:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
