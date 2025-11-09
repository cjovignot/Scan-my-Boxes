import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  const uri = process.env.MONGODB_URI!;
  if (!uri) {
    console.error("❌ MONGODB_URI non défini dans .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    // console.log("✅ MongoDB connecté :", uri);
  } catch (err) {
    console.error("❌ Erreur de connexion MongoDB :", err);
    process.exit(1);
  }
};
