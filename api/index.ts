import express from "express";
import cors from "cors";
import exampleRouter from "./routes/example";
import { connectDB } from "./utils/db";
import "dotenv/config";

const app = express();

// ✅ Autoriser ton frontend déployé
const allowedOrigins = [
  "http://localhost:5173", // pour ton dev local
  "https://scan-my-boxes.vercel.app", // ton site frontend sur Vercel
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/example", exampleRouter);

connectDB();

// ✅ Démarrage local seulement
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 API server running locally on http://localhost:${PORT}`);
  });
}

export default app;
