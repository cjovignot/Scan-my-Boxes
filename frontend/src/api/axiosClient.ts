// frontend/src/api/axiosClient.ts
import axios from "axios";

const isProd = import.meta.env.PROD;

const axiosClient = axios.create({
  baseURL: isProd
    ? `${window.location.origin}/api` // ✅ prod => https://tonsite.vercel.app/api
    : "http://localhost:3001/api", // ✅ dev
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;