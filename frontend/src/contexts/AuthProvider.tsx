import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { AuthContext, type User } from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const didFetchRef = useRef(false);

  // 🔹 Récupère l'utilisateur connecté via cookie HTTP-only
  const fetchMe = async () => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    try {
      const res = await axiosClient.get("/api/auth/me");
      setUser(res.data.user ?? res.data); // res.data.user si API renvoie user, sinon res.data
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  // 🔹 LOGIN classique
  const login = async (email: string, password: string) => {
    const res = await axiosClient.post("/api/auth/login", { email, password });
    setUser(res.data.user ?? res.data);
    navigate("/profile", { replace: true });
    return res.data.user ?? res.data;
  };

  // 🔹 SIGNUP
  const signup = async (name: string, email: string, password: string) => {
    const res = await axiosClient.post("/api/auth/signup", {
      name,
      email,
      password,
    });
    setUser(res.data.user ?? res.data);
    navigate("/profile", { replace: true });
    return res.data.user ?? res.data;
  };

  // 🔹 GOOGLE LOGIN
  const loginWithGoogle = async (credential: string) => {
    const res = await axiosClient.post("/api/auth/google-login", {
      token: credential,
    });
    setUser(res.data.user ?? res.data);
    navigate("/profile", { replace: true });
    return res.data.user ?? res.data;
  };

  // 🔹 LOGOUT
  const logout = async () => {
    try {
      await axiosClient.post("/api/auth/logout");
    } catch {}
    setUser(null);
    navigate("/login", { replace: true });
  };

  // 🔹 Intercepteur : logout auto sauf pour /me
  useEffect(() => {
    const interceptor = axiosClient.interceptors.response.use(
      (res) => res,
      (err) => {
        const url = err.config?.url;
        if (err.response?.status === 401 && url !== "/api/auth/me") {
          logout();
        }
        return Promise.reject(err);
      }
    );
    return () => axiosClient.interceptors.response.eject(interceptor);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, setUser, login, signup, loginWithGoogle, logout }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
