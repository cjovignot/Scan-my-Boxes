import { Schema, model, Document } from "mongoose";

export interface IContentItem {
  name: string;
  quantity: number;
  picture?: string; // URL d’image optionnelle
}

export interface IBox extends Document {
  ownerId: string;
  storageId: string;
  number: string;
  content: IContentItem[];
  destination: string;
  qrcodeURL?: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const contentItemSchema = new Schema<IContentItem>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    picture: { type: String },
  },
  { _id: false } // pas besoin d’un sous-ID pour chaque objet
);

const boxSchema = new Schema<IBox>(
  {
    ownerId: { type: String, required: true, index: true },
    storageId: { type: String, required: true },
    number: { type: String, required: true },
    content: { type: [contentItemSchema], default: [] },
    destination: { type: String, default: "Inconnu" },
    qrcodeURL: { type: String },
    dimensions: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      depth: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

// 🔒 Empêche qu’un même utilisateur ait deux boîtes avec le même numéro
boxSchema.index({ ownerId: 1, number: 1 }, { unique: true });

export const Box = model<IBox>("Box", boxSchema);
