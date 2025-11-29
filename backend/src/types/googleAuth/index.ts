import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: string;
    email: string;
    name?: string;
  };
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}
