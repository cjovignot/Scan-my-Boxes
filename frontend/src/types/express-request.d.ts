import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: string;
    email: string;
    name?: string;
  };
}
