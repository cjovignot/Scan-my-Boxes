import { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { IUser } from "../../../backend/src/types";

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<IUser>;
  login: (email: string, password: string) => Promise<IUser>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  setUser: () => {},
  logout: async () => {},
  signup: async () => {
    throw new Error("signup not implemented");
  },
  login: async () => {
    throw new Error("login not implemented");
  },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await axiosClient.get("/api/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await axiosClient.post("/api/auth/signup", {
      name,
      email,
      password,
    });
    setUser(res.data);
    return res.data;
  };

  const login = async (email: string, password: string) => {
    const res = await axiosClient.post("/api/auth/login", { email, password });
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    await axiosClient.post("/api/auth/logout");
    setUser(null);
  };

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const res = await axiosClient.get("/api/auth/me");
        if (active) setUser(res.data.user);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    run();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, refreshUser, setUser, logout, signup, login }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
