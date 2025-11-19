// // api/routes/stripeWebhook.ts
// import express from "express";
// import dotenv from "dotenv";
// import Stripe from "stripe";
// import bodyParser from "body-parser";
// import { User } from "../models/User";
// import { connectDB } from "../utils/db";

// dotenv.config();

// const router = express.Router();

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-10-29.clover",
// });

// // ⚠️ Stripe webhook doit utiliser raw body
// router.post(
//   "/",
//   bodyParser.raw({ type: "application/json" }),
//   async (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     if (!sig) return res.status(400).send("Missing Stripe signature");

//     let event: Stripe.Event;

//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         process.env.STRIPE_WEBHOOK_SECRET!
//       );
//     } catch (err: any) {
//       console.error("❌ Webhook signature error:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     console.log(`📩 Webhook Stripe reçu : ${event.type}`);

//     try {
//       await connectDB(); // 🔹 Connexion DB

//       switch (event.type) {
//         case "checkout.session.completed": {
//           const session = event.data.object as Stripe.Checkout.Session;
//           if (!session.customer || !session.subscription) break;

//           const subscription = (await stripe.subscriptions.retrieve(
//             session.subscription as string
//           )) as any; // ⚠️ cast any pour accéder à current_period_end

//           const priceId: string = subscription.items.data[0].price.id;
//           let plan: "premium" | "family" = "premium";
//           if (priceId === process.env.STRIPE_PRICE_FAMILY) plan = "family";

//           const email = session.customer_details?.email;
//           if (!email) break;

//           const user = await User.findOne({ email });
//           if (!user) break;

//           user.subscription = {
//             plan,
//             stripeCustomerId: session.customer as string,
//             stripeSubscriptionId: subscription.id,
//             status: subscription.status as "active" | "canceled",
//             currentPeriodEnd: subscription.current_period_end
//               ? new Date(subscription.current_period_end * 1000)
//               : null,
//           };

//           await user.save();
//           console.log(`✅ Subscription mise à jour pour ${email}`);
//           break;
//         }

//         case "customer.subscription.deleted": {
//           const subscription = event.data.object as any;

//           const user = await User.findOne({
//             "subscription.stripeSubscriptionId": subscription.id,
//           });
//           if (!user) break;

//           user.subscription = {
//             ...user.subscription,
//             status: "canceled",
//           };

//           await user.save();
//           console.log(`❌ Subscription annulée pour ${user.email}`);
//           break;
//         }
//       }

//       res.json({ received: true });
//     } catch (err) {
//       console.error("Erreur webhook:", err);
//       res.status(500).send("Internal Server Error");
//     }
//   }
// );

// export default router;

// api/routes/stripeWebhook.ts
// api/routes/stripeWebhook.ts
import express from "express";
import dotenv from "dotenv";
import Stripe from "stripe";
import bodyParser from "body-parser";
import { User } from "../models/User";
import { connectDB } from "../utils/db";

dotenv.config();

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

// ⚠️ Stripe webhook doit utiliser raw body
router.post(
  "/",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    if (!sig) return res.status(400).send("Missing Stripe signature");

    let event: any;

    try {
      if (sig === "test_signature") {
        // Pour Postman : parse le JSON directement
        event = JSON.parse(req.body.toString());
      } else {
        // Pour Stripe réel
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      }

      console.log(`📩 Webhook Stripe reçu : ${event.type}`);

      await connectDB(); // Connexion DB

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          if (!session.customer || !session.subscription) break;

          // ⚡ Subscription prod ou simulation local
          let subscription: any;
          if (sig === "test_signature") {
            subscription = {
              id: session.subscription,
              status: "active",
              items: {
                data: [
                  {
                    price: {
                      id:
                        session.metadata?.plan === "family"
                          ? process.env.STRIPE_PRICE_FAMILY
                          : process.env.STRIPE_PRICE_PREMIUM,
                    },
                  },
                ],
              },
              current_period_end:
                Math.floor(Date.now() / 1000) + 30 * 24 * 3600, // 30 jours
            };
          } else {
            subscription = await stripe.subscriptions.retrieve(
              session.subscription as string
            );
          }

          const priceId: string = subscription.items.data[0].price.id;
          let plan: "premium" | "family" = "premium";
          if (priceId === process.env.STRIPE_PRICE_FAMILY) plan = "family";

          const email = session.customer_details?.email;
          if (!email) break;

          const user = await User.findOne({ email });
          if (!user) break;

          user.subscription = {
            plan,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            status: subscription.status as "active" | "canceled",
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          };

          await user.save();
          console.log(`✅ Subscription mise à jour pour ${email}`);
          break;
        }

        case "customer.subscription.deleted": {
          const subscription =
            sig === "test_signature"
              ? event.data.object
              : (event.data.object as Stripe.Subscription);

          const user = await User.findOne({
            "subscription.stripeSubscriptionId": subscription.id,
          });
          if (!user) break;

          user.subscription = {
            ...user.subscription,
            status: "canceled",
          };

          await user.save();
          console.log(`❌ Subscription annulée pour ${user.email}`);
          break;
        }

        default:
          console.log("ℹ️ Event non géré:", event.type);
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Erreur webhook:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

export default router;
