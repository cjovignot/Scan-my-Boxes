// api/src/types/express.d.ts
import type { IUser } from "./user";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};
