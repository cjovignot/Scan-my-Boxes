import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser()); // ✅ doit être avant tes routes
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // ✅ obligatoire pour envoyer le cookie
  })
);

app.get("/", (req, res) => {
  res.json({ message: "Backend running 🚀" });
});

// Routes
import authRouter from "./routes/auth";
import boxesRouter from "./routes/boxes";
import storagesRouter from "./routes/storages";
import userRouter from "./routes/user";
app.use("/api/auth", authRouter);
app.use("/api/boxes", boxesRouter);
app.use("/api/storages", storagesRouter);
app.use("/api/user", userRouter);

// MongoDB connection (local dev only)
if (!process.env.VERCEL) {
  mongoose
    .connect(process.env.MONGODB_URI!)
    .then(() => console.log("🟢 MongoDB connected"))
    .catch((err) => console.error("🔴 MongoDB error:", err));
}

// Start local server
if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
}

// Needed for Vercel serverless functions
export default app;
