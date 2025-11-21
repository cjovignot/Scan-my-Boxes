import axiosClient from "./axiosClient";

export const authApi = {
  // 🔹 Login classique
  login: (data: { email: string; password: string }) =>
    axiosClient.post("api/auth/login", data),

  // 🔹 Signup public
  signup: (data: { name: string; email: string; password: string }) =>
    axiosClient.post("api/auth/signup", data),

  // 🔹 Login Google (token envoyé par Google)
  googleLogin: (credential: string) =>
    axiosClient.post("api/auth/google-login", { credential }),

  // 🔹 Récupération du user connecté
  getMe: () => axiosClient.get("api/auth/me"),

  // 🔹 Logout
  logout: () => axiosClient.post("api/auth/logout"),
};
