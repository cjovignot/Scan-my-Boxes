import { Schema, model, Document, Types } from "mongoose";

export interface IContentItem {
  name: string;
  quantity: number;
  picture?: string;
}

export interface IBox extends Document {
  ownerId: Types.ObjectId;
  storageId: Types.ObjectId;
  number: string;
  fragile: boolean;
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
  { _id: false }
);

const boxSchema = new Schema<IBox>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    storageId: {
      type: Schema.Types.ObjectId,
      ref: "Storage",
      required: false,
      default: null,
    },
    number: { type: String, required: true },
    fragile: { type: Boolean, default: false },
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

boxSchema.index({ ownerId: 1, number: 1 }, { unique: true });

export const Box = model<IBox>("Box", boxSchema);
