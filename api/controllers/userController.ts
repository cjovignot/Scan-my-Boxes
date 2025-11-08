// ============================
// 📁 controllers/userController.ts
// ============================

import { User } from "../models/User";
import { connectDB } from "../utils/db";
import bcrypt from "bcryptjs";

// ====================================
// 🔹 Crée un utilisateur
// ====================================
export async function createUser(data: {
  name?: string;
  email: string;
  password?: string;
  picture?: string;
  provider?: string;
  role?: string;
}) {
  await connectDB();

  const existing = await User.findOne({ email: data.email });
  if (existing) return existing;

  const user = await User.create({
    name: data.name || "Utilisateur",
    email: data.email,
    password: data.password ? await bcrypt.hash(data.password, 10) : "-",
    picture: data.picture || "",
    provider: data.provider || "local",
    role: data.role || "user",
  });

  return user;
}

// ====================================
// 🔹 Met à jour un utilisateur par ID (sans écraser le rôle)
// ====================================
export async function updateUserById(
  id: string,
  updates: Partial<{
    name: string;
    picture: string;
    provider: string;
    password: string;
  }>
) {
  await connectDB();

  const user = await User.findById(id);
  if (!user) return null;

  await User.updateOne(
    { _id: id },
    {
      $set: {
        ...updates,
        role: user.role, // 🔐 ne jamais écraser le rôle existant
      },
    }
  );

  return await User.findById(id);
}

// ====================================
// 🔹 Met à jour un utilisateur via son email (utile pour Google OAuth)
// ====================================
export async function updateUserByEmail(
  email: string,
  updates: Partial<{
    name: string;
    picture: string;
    provider: string;
    password: string;
  }>
) {
  await connectDB();

  const user = await User.findOne({ email });
  if (!user) return null;

  await User.updateOne(
    { email },
    {
      $set: {
        ...updates,
        role: user.role, // 🔐 ne jamais écraser le rôle
      },
    }
  );

  return await User.findOne({ email });
}

// ====================================
// 🔹 Supprime un utilisateur par ID
// ====================================
export async function deleteUserById(id: string) {
  await connectDB();
  const user = await User.findById(id);
  if (!user) return null;

  await user.deleteOne();
  return user;
}

// ====================================
// 🔹 Récupère un utilisateur par ID
// ====================================
export async function findUserById(id: string) {
  await connectDB();
  return await User.findById(id);
}

// ====================================
// 🔹 Récupère un utilisateur par email
// (utile encore pour le login Google par ex.)
// ====================================
export async function findUserByEmail(email: string) {
  await connectDB();
  return await User.findOne({ email });
}

// ====================================
// 🔹 Récupère tous les utilisateurs
// ====================================
export async function findAllUsers() {
  await connectDB();
  return await User.find().sort({ createdAt: -1 });
}
