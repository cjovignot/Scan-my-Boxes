import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import exampleRouter from "./routes/example";
import userRouter from "./routes/user";
import authRouter from "./routes/auth";
import boxesRouter from "./routes/boxes";
import storageRoutes from "./routes/storages";
import { connectDB } from "./utils/db"; // ✅ utilise la fonction centralisée

dotenv.config();

const app = express();

// ============================
// 🌐 CORS configuration
// ============================
const allowedOrigins = [
  "http://localhost:5173",
  "https://scan-my-boxes.vercel.app",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

// ============================
// 🧠 Middleware
// ============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================
// 📦 Routes
// ============================
app.use("/api/example", exampleRouter);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/boxes", boxesRouter);
app.use("/api/storages", storageRoutes);

// ============================
// 💡 Middleware global d’erreur
// ============================
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("🔥 Erreur serveur :", err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
);

// ============================
// 🧩 Connexion MongoDB unique
// ============================
(async () => {
  await connectDB(); // ✅ Appel unique et centralisé
})();

// ============================
// 🚀 Démarrage du serveur local
// ============================
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 API locale disponible sur : http://localhost:${PORT}`);
  });
}

// ✅ Export pour Vercel
export default app;
