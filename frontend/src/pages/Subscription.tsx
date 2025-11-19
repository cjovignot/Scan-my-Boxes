import { usePlans } from "../hooks/usePlans";
import { motion, AnimatePresence } from "framer-motion";
import { useApiMutation } from "../hooks/useApiMutation";
import { useState } from "react";

type PopupType = "success" | "error";

const Subscription = () => {
  const [popupMessage, setPopupMessage] = useState<{
    message: string;
    type: PopupType;
  } | null>(null);

  const { data: plans, loading: loadingPlans } = usePlans();

  const { mutate: createCheckoutSession, loading: loadingCheckout } =
    useApiMutation<{ url: string }, { priceId: string }>(
      "api/subscription/create-checkout-session",
      "POST",
      {
        onError: (err) => {
          setPopupMessage({
            message:
              err?.response?.data?.error || "Erreur lors de l'abonnement.",
            type: "error",
          });
        },
      }
    );

  const handleSubscribe = async (planId?: string) => {
    if (!planId) {
      setPopupMessage({
        message: "Vous êtes maintenant sur le plan Freemium !",
        type: "success",
      });
      return;
    }

    try {
      const data = await createCheckoutSession({ priceId: planId });
      if (data.url) {
        window.location.href = data.url;
      } else {
        // si pas d'URL mais succès
        setPopupMessage({
          message: "Abonnement créé avec succès !",
          type: "success",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loadingPlans)
    return (
      <div className="flex items-center justify-center max-w-4xl min-h-screen p-6 m-auto">
        <p className="font-bold text-yellow-400">Chargement des plans...</p>
      </div>
    );

  if (!plans || plans.length === 0) return <p>Aucun plan disponible.</p>;

  return (
    <div className="max-w-4xl p-6 m-auto">
      <h1 className="mb-8 text-3xl font-bold text-center text-yellow-400">
        Choisissez votre abonnement
      </h1>

      {/* Popup animé */}
      <AnimatePresence>
        {popupMessage && (
          <motion.div
            key="popup"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              className={`max-w-sm p-6 text-center rounded-xl shadow-lg bg-gray-800`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <p className="mb-6">{popupMessage.message}</p>
              <button
                onClick={() => setPopupMessage(null)}
                className={`px-6 py-1 font-semibold text-black rounded-full bg-yellow-400`}
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
        {/* Freemium */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="flex flex-col justify-between p-6 bg-gray-900 border border-gray-800 shadow-lg rounded-2xl"
        >
          <div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-400">
              Freemium
            </h2>
            <p className="text-gray-500">
              Accès limité aux fonctionnalités de base.
            </p>
          </div>
          <button
            onClick={() => handleSubscribe(undefined)}
            className="w-full px-4 py-2 mt-4 font-semibold text-black bg-gray-400 rounded-full hover:bg-gray-500"
          >
            Choisir
          </button>
        </motion.div>

        {/* Plans Stripe */}
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.03 }}
            className="flex flex-col justify-between p-6 bg-gray-900 border border-gray-800 shadow-lg rounded-2xl"
          >
            <div>
              <h2 className="mb-2 text-2xl font-semibold text-green-400">
                {plan.name}
              </h2>
              <p className="text-gray-500">{plan.description}</p>
            </div>
            <div className="flex flex-col items-center gap-3 mt-4">
              <span className="text-xl font-bold text-green-300">
                {plan.price.toFixed(2)} {plan.currency.toUpperCase()}/mois
              </span>
              <button
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={loadingCheckout}
                className="w-full px-4 py-2 font-semibold text-black bg-green-400 rounded-full hover:bg-green-500"
              >
                S'abonner
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Subscription;
