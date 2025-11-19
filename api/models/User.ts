// api/models/User.ts
import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    picture: { type: String, required: false },
    provider: { type: String, required: false },

    printSettings: { type: Object, default: {} },

    // 🔹 Champ subscription
    subscription: {
      plan: {
        type: String,
        enum: ["freemium", "premium", "family"],
        required: false,
      },
      stripeCustomerId: { type: String, required: false, default: null },
      stripeSubscriptionId: { type: String, required: false, default: null },
      status: {
        type: String,
        enum: ["active", "canceled", "past_due", "incomplete", "trialing"],
        required: false,
        default: null,
      },
      currentPeriodEnd: { type: Date, required: false, default: null },
    },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
