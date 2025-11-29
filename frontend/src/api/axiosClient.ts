import axios from "axios";

const axiosClient = axios.create({
  baseURL: "/", // IMPORTANT : utilise le proxy Vite
  withCredentials: true, // envoie les cookies
});

export default axiosClient;
