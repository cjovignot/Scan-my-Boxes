// src/routes/admin.ts
import { Router } from "express";
import { checkAuth } from "middlewares/checkAuth";
import { checkAdmin } from "middlewares/checkAdmin";

const router = Router();

router.get("/dashboard", checkAuth, checkAdmin, (req, res) => {
  res.json({
    message: "Bienvenue dans le panneau admin 🚀",
    user: req.user,
  });
});

export default router;
