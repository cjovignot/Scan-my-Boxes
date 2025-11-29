import { Router } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import { GoogleTokenResponse } from "../types/index";

const router = Router();

const BACKEND_REDIRECT_URI = `${process.env.BACKEND_URL}/api/auth/google/callback`;

// ------------------------------------------------------
// 1️⃣ Google OAuth URL
// ------------------------------------------------------
router.get("/google/url", (req, res) => {
  console.log("[GOOGLE URL] Creating OAuth URL");

  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

  const options = {
    redirect_uri: BACKEND_REDIRECT_URI,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options);
  const url = `${rootUrl}?${qs.toString()}`;

  console.log("[GOOGLE URL] ->", url);

  res.json({ url });
});

// ------------------------------------------------------
// 2️⃣ Google Callback
// ------------------------------------------------------
router.get("/google/callback", async (req, res) => {
  console.log("\n===== GOOGLE CALLBACK =====");
  console.log("[CALLBACK] Query:", req.query);

  try {
    const { code } = req.query;
    if (!code) {
      console.log("[CALLBACK] ❌ No code");
      return res.status(400).json({ error: "Code is required" });
    }

    console.log("[CALLBACK] ✔ Code:", code);

    const tokenRequestBody = new URLSearchParams({
      code: code as string,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: BACKEND_REDIRECT_URI,
      grant_type: "authorization_code",
    });

    console.log("[CALLBACK] Requesting Google tokens…");

    const { data } = await axios.post<GoogleTokenResponse>(
      "https://oauth2.googleapis.com/token",
      tokenRequestBody,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    console.log("[CALLBACK] ✔ Token response:", data);

    const { access_token } = data;

    console.log("[CALLBACK] Fetching Google user info…");

    const { data: userInfo } = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    console.log("[CALLBACK] ✔ Google user:", userInfo);

    let user = await User.findOne({ email: userInfo.email });

    if (user) {
      console.log("[CALLBACK] User exists:", user.email);
    } else {
      console.log("[CALLBACK] Creating new user");
      user = await User.create({
        name: userInfo.name,
        email: userInfo.email,
        role: "user",
      });
    }

    console.log("[CALLBACK] Creating JWT…");

    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        provider: user.provider,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    console.log("[CALLBACK] JWT created:", token);

    console.log("[CALLBACK] Setting cookie…");

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // IMPORTANT EN LOCAL
      sameSite: "lax", // PERMET LE COOKIE EN HTTP
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("[CALLBACK] Cookie set ✔");

    res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
  } catch (err) {
    console.error("[CALLBACK] ❌ Error:", err);
    res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
  }
});

// ------------------------------------------------------
// 3️⃣ Logout
// ------------------------------------------------------
router.post("/logout", (req, res) => {
  console.log("[LOGOUT] Clearing cookie");
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// ------------------------------------------------------
// 4️⃣ /me
// ------------------------------------------------------
router.get("/me", (req, res) => {
  console.log("\n===== /auth/me =====");

  const token = req.cookies.token;
  console.log("[ME] token:", token);

  if (!token) {
    console.log("[ME] No token → null");
    return res.json({ user: null });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("[ME] ✔ Token valid:", user);
    res.json({ user });
  } catch {
    console.log("[ME] ❌ Invalid token");
    res.json({ user: null });
  }
});

export default router;
