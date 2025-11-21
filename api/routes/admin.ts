// api/routes/admin.ts
import { Router, Response, Request as ExpressRequest } from "express";
import { checkAuth } from "../middlewares/checkAuth";
import { checkAdmin } from "../middlewares/checkAdmin";
import { IUser } from "../src/types/user"; // ton type IUser

// Type pour req avec user
type AuthRequest = ExpressRequest & { user?: IUser };

const router = Router();

router.get(
  "/admin",
  checkAuth,
  checkAdmin,
  (req: AuthRequest, res: Response) => {
    res.json({
      message: "Bienvenue dans le panneau admin 🚀",
      user: req.user,
    });
  }
);

export default router;
