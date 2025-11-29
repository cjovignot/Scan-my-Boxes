import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI manquant dans .env");
}

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    // console.log("📦 DB déjà connectée (cache)");
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = db.connections[0].readyState === 1;

    console.log("🟢 MongoDB connecté depuis utils/db.ts");
  } catch (error) {
    console.error("🔴 Erreur connexion MongoDB :", error);
    throw error;
  }
}
