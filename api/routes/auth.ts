// api/routes/auth.ts
router.post("/social-login", async (req, res) => {
  await connectDB();
  const { provider, token, profile } = req.body;

  let email;

  if (provider === "google") email = profile?.email;
  else if (provider === "apple") {
    const decoded = jwtDecode(token);
    // @ts-ignore
    email = decoded.email;
  }

  if (!email) return res.status(400).json({ error: "Email introuvable." });

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name: profile?.name || "Utilisateur", email });
  }

  res.json({ message: "✅ Connecté", user });
});