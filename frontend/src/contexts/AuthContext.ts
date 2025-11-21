import { createContext, useContext } from "react";

// 🔹 Type utilisateur minimal
export interface User {
  _id: string;
  name: string;
  email: string;
  role?: "user" | "admin";
  provider?: string;
  picture?: string;
  token?: string; // ajout du token
}

// 🔹 Type du contexte
export interface AuthContextType {
  user: User | null;
  loading: boolean; // <-- ajouté
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  loginWithGoogle: (credential: string) => Promise<User>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
