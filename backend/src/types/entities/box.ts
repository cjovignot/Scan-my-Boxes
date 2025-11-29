export interface IContentItem {
  name: string;
  quantity: number;
  picture?: string;
}

export interface IBoxDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface IBox {
  _id?: string; // optionnel si nouvel objet
  ownerId: string; // ObjectId en string
  storageId?: string | null; // ObjectId en string
  number: string;
  fragile?: boolean;
  content?: IContentItem[];
  destination?: string;
  qrcodeURL?: string;
  dimensions: IBoxDimensions;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreateBoxPayload = {
  ownerId: string;
  content: {
    name: string;
    quantity: number;
    picture: string;
    uploading?: boolean;
  }[];
  dimensions: { width: number; height: number; depth: number };
  destination: string;
  storageId: string;
  width: string;
  height: string;
  depth: string;
  fragile: boolean;
};
