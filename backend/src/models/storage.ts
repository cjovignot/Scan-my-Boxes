import { Schema, model, Document, Types } from "mongoose";

export interface IStorage extends Document {
  name: string;
  address?: string;
  ownerId: Types.ObjectId;
  boxes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const storageSchema = new Schema<IStorage>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true, default: "" },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    boxes: [{ type: Schema.Types.ObjectId, ref: "Box" }],
  },
  { timestamps: true }
);

export const Storage = model<IStorage>("Storage", storageSchema);
