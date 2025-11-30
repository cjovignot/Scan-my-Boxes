import { Schema, model, Document } from "mongoose";

export interface User {
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  picture?: string;
  provider?: string;
  printSettings?: Record<string, any>;
}

export interface UserDocument extends User, Document {}

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    picture: { type: String },
    provider: { type: String },
    printSettings: { type: Object, default: {} },
  },
  { timestamps: true }
);

// ⚠️ IMPORTANT : AUCUN GÉNÉRIQUE ICI
export const User = model("User", userSchema);
