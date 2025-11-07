import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    _id: { type: String, required: false },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // 🔧 facultatif pour Google
    picture: { type: String, required: false }, // 🆕 pour les comptes Google
    role: { type: String, default: "user" },
    provider: { type: String, default: "local" }, // 🆕 'google' | 'local'
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
