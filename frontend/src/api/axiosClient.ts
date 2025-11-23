import axios from "axios";

const base = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ⚠️ IMPORTANT : pas de "/api" ici pour éviter les doublons
// Tu appelleras ensuite axiosClient.get("/api/auth/me")
const axiosClient = axios.create({
  baseURL: base,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // indispensable pour envoyer les cookies HTTP-only
});

// ✅ Aucun token → pas d'Authorization
axiosClient.interceptors.request.use(
  (config) => {
    // on ne touche à rien, on laisse axios gérer
    return config;
  },
  (error) => Promise.reject(error)
);

// ❗ Laisse le AuthProvider gérer les 401
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default axiosClient;
