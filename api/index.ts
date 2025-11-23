import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import exampleRouter from "./routes/example";
import userRouter from "./routes/user";
import authRouter from "./routes/auth";
import boxesRouter from "./routes/boxes";
import storageRoutes from "./routes/storages";
import adminRoutes from "./routes/admin";

import { connectDB } from "./utils/db";

dotenv.config();

const app = express();

// ============================
// 🌐 CORS — propre + compatible cookies HTTP-only
// ============================

const allowedOrigins = [
  "http://localhost:5173",
  "https://scan-my-boxes.vercel.app",
  "https://preview-scan-my-boxes.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // autoriser requêtes server-to-server ou internes
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin non autorisée par CORS"), false);
    },
    credentials: true, // ⚠️ nécessaire pour cookies HTTP-only
  })
);

// ============================
// 🧠 Middleware
// ============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔧 Helmet réglé pour ne PAS casser les cookies cross-site SameSite=None
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(cookieParser());

// ============================
// 📦 Routes
// ============================
app.use("/api/example", exampleRouter);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/boxes", boxesRouter);
app.use("/api/storages", storageRoutes);
app.use("/api/admin", adminRoutes);

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
// 🧩 Connexion MongoDB
// ============================
(async () => {
  await connectDB();
})();

// ============================
// 🚀 Démarrage local seulement
// ============================
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 API locale : http://localhost:${PORT}`);
  });
}

// Export Vercel
export default app;
