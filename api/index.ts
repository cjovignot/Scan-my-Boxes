import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import exampleRouter from "./routes/example";
import userRouter from "./routes/user";
import authRouter from "./routes/auth";
import { connectDB } from "./utils/db";
import dotenv from "dotenv";
import path from "path";

// ============================
// 🔹 Configuration .env
// ============================
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// ============================
// 🚀 Initialisation express
// ============================
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

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

// ============================
// 🧠 Middleware
// ============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================
// 🗄️ Connexion à la base de données
// ============================
connectDB()
  .then(() => console.log("✅ MongoDB connecté"))
  .catch((err) => console.error("❌ Erreur MongoDB :", err));

// ============================
// 📦 Routes
// ============================
app.use("/api/example", exampleRouter);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);

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
// 🧑‍💻 Serveur local (dev uniquement)
// ============================
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 API locale disponible sur : http://localhost:${PORT}`);
  });
}

// ============================
// ☁️ Export pour Vercel (serverless)
// ============================
export const handler = serverless(app);
export default app;
