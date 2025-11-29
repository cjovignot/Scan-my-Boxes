export type UserRole = "user" | "admin";

export interface IUser {
  _id?: string; // optionnel si nouvel utilisateur
  name: string;
  email: string;
  password?: string; // optionnel si OAuth
  role?: UserRole; // par défaut "user"
  picture?: string; // photo profil
  provider?: string; // "google", "local", etc.
  printSettings?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}
