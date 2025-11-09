import PageWrapper from "../../components/PageWrapper";
import UserInfos from "../../components/UserInfos";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="flex flex-col items-center px-6 py-10 text-white">
        {/* 🧭 En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-yellow-400"
          >
            <ArrowLeft size={16} />
            Retour
          </button>
          <h1 className="mt-4 text-3xl font-semibold text-yellow-400">
            Gestion utilisateurs
          </h1>
        </motion.div>
        {/* Contenu : Liste des utilisateurs */}
        <UserInfos />

        {/* Footer / note */}
        <p className="mt-10 text-sm text-center text-gray-500">
          Informations des utilisateurs enregistrés dans la base.
        </p>
      </div>
    </PageWrapper>
  );
};

export default Admin;
