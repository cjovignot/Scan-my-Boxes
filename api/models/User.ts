import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // 👈 plus de "required: true"
    role: { type: String, required: false },

    // ✅ Ajout pour Google login
    picture: { type: String, required: false },
    provider: { type: String, required: false }, // ex: "google"
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
