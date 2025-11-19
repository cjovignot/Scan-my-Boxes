import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

// Route pour récupérer les plans
router.get("/", async (req, res) => {
  try {
    // Récupère tous les produits
    const products = await stripe.products.list({ limit: 100 });
    // Récupère tous les prix
    const prices = await stripe.prices.list({ limit: 100 });

    const plans = products.data.map((product) => {
      const price = prices.data.find((p) => p.product === product.id);
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        priceId: price?.id,
        price: price?.unit_amount ? price.unit_amount / 100 : 0,
        currency: price?.currency || "usd",
      };
    });

    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
