import express from "express";
import cors from "cors";
import exampleRouter from "./routes/example";
import { connectDB } from "./utils/db";
import "dotenv/config"; // pour charger ton .env localement

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/example", exampleRouter);

// Connexion à MongoDB
connectDB();

// ✅ Démarrage local seulement
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 API server running locally on http://localhost:${PORT}`);
  });
}

// 👇 Ne pas écouter le port sur Vercel
export default app;
