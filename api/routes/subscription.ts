import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

// Créer une session Stripe
router.post("/create-checkout-session", async (req, res) => {
  const frontendDomain = process.env.FRONTEND_DOMAIN;

  const { priceId } = req.body;

  if (!priceId) {
    return res.status(400).json({ error: "priceId manquant" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${frontendDomain}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendDomain}/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
