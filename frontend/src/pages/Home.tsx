import PageWrapper from "../components/PageWrapper";
import { motion } from "framer-motion";
import {
  Warehouse,
  Boxes,
  Ruler,
  Tag,
  Clock,
  PackageSearch,
  Plus,
} from "lucide-react";
import { useApi } from "../hooks/useApi";
import { useApiMutation } from "../hooks/useApiMutation";
import { useNavigate } from "react-router-dom";

type Box = {
  _id: string;
  ownerId: string;
  storageId: string;
  number: string;
  content: string[];
  destination: string;
  qrcodeURL: string;
  dimensions: { width: number; height: number; depth: number };
  createdAt: string;
};

type Storage = {
  _id: string;
  ownerId: string;
  name: string;
  address?: string;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // =============================
  // 🔹 Fetch API Data
  // =============================

  const {
    data: storagesRaw,
    loading: loadingStorages,
    error: errorStorages,
  } = useApi<Storage[]>(`/api/storages?ownerId=${user?._id}`, {
    skip: !user?._id,
  });

  const storages = storagesRaw ?? [];

  const {
    data: boxesRaw,
    loading: loadingBoxes,
    error: errorBoxes,
    refetch: refetchBoxes,
  } = useApi<Box[]>(`/api/boxes?ownerId=${user?._id}`, { skip: !user?._id });

  const boxes = boxesRaw ?? [];

  // =============================
  // 🧮 Calculs des KPI
  // =============================

  const totalWarehouses = storages.length;
  const totalBoxes = boxes.length;
  const totalVolumeCm3 = boxes.reduce(
    (sum, b) =>
      sum + b.dimensions.width * b.dimensions.height * b.dimensions.depth,
    0
  );
  const totalVolumeM3 = totalVolumeCm3 / 1_000_000;
  const totalObjects = boxes.reduce((sum, b) => sum + b.content.length, 0);
  const avgBoxesPerWarehouse =
    totalWarehouses > 0 ? totalBoxes / totalWarehouses : 0;
  const avgVolumePerBox = totalBoxes > 0 ? totalVolumeM3 / totalBoxes : 0;

  const destinationCount: Record<string, number> = {};
  boxes.forEach((b) => {
    destinationCount[b.destination] =
      (destinationCount[b.destination] || 0) + 1;
  });

  const topDestination =
    Object.keys(destinationCount).length > 0
      ? Object.entries(destinationCount).sort((a, b) => b[1] - a[1])[0][0]
      : "N/A";

  const lastBoxAdded = [...boxes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  const stats = [
    {
      id: "warehouses",
      label: "Total d'entrepôts",
      value: totalWarehouses,
      description: "Entrepôts enregistrés",
      icon: Warehouse,
    },
    {
      id: "avgBoxes",
      label: "Moy./entrepôt",
      value: avgBoxesPerWarehouse.toFixed(1),
      description: "Moyenne de boîtes par entrepôt",
      icon: Boxes,
    },
    {
      id: "boxes",
      label: "Total de boîtes",
      value: totalBoxes,
      description: "Boîtes créées",
      icon: Boxes,
    },
    {
      id: "volume",
      label: "Volume total",
      value: `${totalVolumeM3.toFixed(2)} m³`,
      description: "Volume cumulé",
      icon: Ruler,
    },
    {
      id: "objects",
      label: "Total d’objets",
      value: totalObjects,
      description: "Objets stockés au total",
      icon: PackageSearch,
    },
    {
      id: "avgVolume",
      label: "Moy./boîte",
      value: `${avgVolumePerBox.toFixed(2)} m³`,
      description: "Moyenne du volume par boîte",
      icon: Ruler,
    },
    {
      id: "topDestination",
      label: "Top destination",
      value: topDestination,
      description: "Pièce la plus utilisée",
      icon: Tag,
    },
    {
      id: "lastAdded",
      label: "Récente",
      value: lastBoxAdded
        ? `#${lastBoxAdded.number} (${lastBoxAdded.destination})`
        : "Aucune",
      description: "Dernière boîte ajoutée",
      icon: Clock,
    },
  ];

  // =============================
  // 🎨 Rendering
  // =============================

  if (loadingStorages || loadingBoxes)
    return (
      <p className="flex items-center justify-center min-h-screen text-center text-yellow-400">
        Chargement...
      </p>
    );

  if (errorStorages || errorBoxes)
    return (
      <p className="text-center text-red-400">
        Erreur : {errorStorages || errorBoxes}
      </p>
    );

  return (
    <PageWrapper>
      <div className="flex flex-col px-6 py-6 text-white">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between w-full max-w-4xl mb-6"
        >
          <h1 className="flex justify-center w-full py-6 text-3xl font-semibold text-yellow-400">
            Tableau de bord
          </h1>
        </motion.div>

<div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {stats.map(({ id, label, value, description, icon: Icon }) => (
    <motion.div
      key={id}
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: "spring", stiffness: 230, damping: 18 }}
      className="p-5 rounded-2xl bg-gray-900 border border-gray-800 
                 hover:border-yellow-400/40 shadow-lg hover:shadow-xl 
                 transition-all duration-300"
    >
      {/* ICON BADGE */}
      <div className="flex items-center justify-center w-12 h-12 rounded-xl 
                      bg-gray-800 border border-gray-700 
                      group-hover:border-yellow-400 transition-all duration-300">
        <Icon
          size={24}
          className="text-yellow-400 group-hover:text-yellow-300 transition-colors"
        />
      </div>

      {/* LABEL */}
      <h2 className="mt-4 text-sm font-semibold text-gray-300 uppercase tracking-wide">
        {label}
      </h2>

      {/* MAIN VALUE */}
      <p className="mt-1 text-3xl font-bold text-white">
        {value}
      </p>

      {/* DESCRIPTION */}
      <p className="mt-2 text-xs text-gray-500">
        {description}
      </p>
    </motion.div>
  ))}
</div>

        <p className="mt-10 text-sm text-center text-gray-500">
          Aperçu global de votre activité.
        </p>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
