// api/src/types/user.ts
import { Schema, model, Document } from "mongoose";

// Interface complète pour Mongoose
export interface IUserDocument extends Document {
  _id: string;
  name: string;
  email: string;
  password?: string;
  picture?: string;
  role: "user" | "admin";
  provider: "local" | "google";
  printSettings?: Record<string, any>;
}

// Interface simplifiée pour req.user (exclut le mot de passe)
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  provider?: "local" | "google";
  picture?: string;
}

// Schéma Mongoose
const userSchema = new Schema<IUserDocument>(
  {
    _id: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    picture: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    printSettings: { type: Object, default: {} },
  },
  { timestamps: true }
);

// Modèle Mongoose
export const User = model<IUserDocument>("User", userSchema);
