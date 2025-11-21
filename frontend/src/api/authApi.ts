import axiosClient from "./axiosClient";

export const authApi = {
  // 🔹 Login classique
  login: (data: { email: string; password: string }) =>
    axiosClient.post("/auth/login", data),

  // 🔹 Signup public
  signup: (data: { name: string; email: string; password: string }) =>
    axiosClient.post("/auth/signup", data),

  // 🔹 Login Google (token envoyé par Google)
  googleLogin: (credential: string) =>
    axiosClient.post("/auth/google-login", { credential }),

  // 🔹 Récupération du user connecté
  getMe: () => axiosClient.get("/auth/me"),

  // 🔹 Logout
  logout: () => axiosClient.post("/auth/logout"),
};
