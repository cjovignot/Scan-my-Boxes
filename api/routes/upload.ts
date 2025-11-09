import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// POST /api/upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "Aucun fichier reçu" });

    const result = await cloudinary.uploader.upload_stream(
      { folder: "boxes" },
      (error, uploadResult) => {
        if (error) return res.status(500).json({ error });
        res.json({ url: uploadResult?.secure_url });
      }
    );

    // stream upload
    if (result && file.buffer) {
      const stream = result;
      stream.end(file.buffer);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
