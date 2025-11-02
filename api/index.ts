import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import exampleRouter from "./routes/example";
import { connectDB } from "./utils/db";
import "dotenv/config";

const app = express();

// ✅ CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://scan-my-boxes.vercel.app",
];

// Middleware CORS
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://scan-my-boxes.vercel.app",
  ];
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

// JSON parsing
app.use(express.json());

// ✅ Routes
app.use("/api/example", exampleRouter);

// ✅ Database
connectDB();

// ✅ Local dev server (non utilisé par Vercel)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Local API running on http://localhost:${PORT}`);
  });
}

// ✅ Export handler for Vercel (serverless)
export const handler = serverless(app);
export default app;
