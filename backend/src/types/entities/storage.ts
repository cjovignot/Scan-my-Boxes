export interface IStorage {
  _id?: string; // optionnel avant insertion
  name: string;
  address?: string;
  ownerId: string; // ObjectId en string
  boxes?: string[]; // array d'ObjectId en string
  createdAt?: Date;
  updatedAt?: Date;
}
