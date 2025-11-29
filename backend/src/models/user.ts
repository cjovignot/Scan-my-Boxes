import { Schema, model, type Document } from "mongoose";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  picture?: string;
  provider?: string;
  printSettings?: Record<string, any>;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    picture: { type: String, required: false },
    provider: { type: String, required: false },

    printSettings: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export const User = model<UserDocument>("User", userSchema);
