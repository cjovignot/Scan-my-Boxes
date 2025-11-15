import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    picture: { type: String, required: false },
    provider: { type: String, required: false },

    // 🔹 Nouveau champ
    printSettings: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
