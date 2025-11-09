// ============================
// 📁 controllers/storageController.ts
// ============================

import { Storage } from "../models/Storage";
import { connectDB } from "../utils/db";

// ====================================
// 🔹 Crée un entrepôt
// ====================================
export async function createStorage(data: {
  name: string;
  address?: string;
  ownerId: string;
}) {
  await connectDB();

  if (!data.name || !data.ownerId) {
    throw new Error("Nom et ownerId requis");
  }

  const storage = await Storage.create({
    name: data.name,
    address: data.address || "",
    ownerId: data.ownerId,
    boxes: [],
  });

  return storage;
}

// ====================================
// 🔹 Récupère tous les entrepôts (optionnellement par ownerId)
// ====================================
export async function findAllStorages(ownerId?: string) {
  await connectDB();

  const filter: any = {};
  if (ownerId) filter.ownerId = ownerId;

  return await Storage.find(filter).sort({ createdAt: -1 });
}

// ====================================
// 🔹 Récupère un entrepôt par ID
// ====================================
export async function findStorageById(id: string) {
  await connectDB();
  return await Storage.findById(id);
}

// ====================================
// 🔹 Met à jour un entrepôt
// ====================================
export async function updateStorageById(
  id: string,
  updates: Partial<{
    name: string;
    address: string;
    boxes: any[];
  }>
) {
  await connectDB();

  const storage = await Storage.findById(id);
  if (!storage) return null;

  await Storage.updateOne({ _id: id }, updates);
  return await Storage.findById(id);
}

// ====================================
// 🔹 Supprime un entrepôt
// ====================================
export async function deleteStorageById(id: string) {
  await connectDB();

  const storage = await Storage.findById(id);
  if (!storage) return null;

  await storage.deleteOne();
  return storage;
}
