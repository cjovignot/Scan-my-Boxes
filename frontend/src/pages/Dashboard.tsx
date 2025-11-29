import PageWrapper from "../components/UI/PageWrapper";
import { motion } from "framer-motion";
import {
  Warehouse,
  Boxes,
  Ruler,
  Tag,
  Clock,
  PackageSearch,
} from "lucide-react";
import { useApi } from "../hooks/useApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// =============================
// 🔹 Types locaux (NE PAS IMPORTER depuis le back)
// =============================

export interface IStorage {
  _id: string;
  name: string;
  address?: string;
  ownerId: string;
  createdAt: string;
}

export interface IBox {
  _id: string;
  number: number;
  ownerId: string;
  destination: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  content: string[];
  createdAt: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // =============================
  // 🔹 Fetch API Data
  // =============================

  const {
    data: storagesRaw,
    loading: loadingStorages,
    error: errorStorages,
  } = useApi<IStorage[]>(
    user?._id ? `/api/storages?ownerId=${user._id}` : null
  );

  const storages = storagesRaw ?? [];

  const {
    data: boxesRaw,
    loading: loadingBoxes,
    error: errorBoxes,
  } = useApi<IBox[]>(user?._id ? `/api/boxes?ownerId=${user._id}` : null);

  const boxes = boxesRaw ?? [];

  // =============================
  // 🧮 Calculs des KPI
  // =============================

  const totalWarehouses = storages.length;
  const totalBoxes = boxes.length;

  const totalVolumeCm3 = boxes.reduce((sum, b) => {
    if (!b.dimensions) return sum;
    return (
      sum +
      (b.dimensions.width || 0) *
        (b.dimensions.height || 0) *
        (b.dimensions.depth || 0)
    );
  }, 0);

  const totalVolumeM3 = totalVolumeCm3 / 1_000_000;
  const totalObjects = boxes.reduce((sum, b) => sum + b.content.length, 0);

  const avgBoxesPerWarehouse =
    totalWarehouses > 0 ? totalBoxes / totalWarehouses : 0;

  const avgVolumePerBox = totalBoxes > 0 ? totalVolumeM3 / totalBoxes : 0;

  const destinationCount: Record<string, number> = {};
  boxes.forEach((b) => {
    if (b.destination) {
      destinationCount[b.destination] =
        (destinationCount[b.destination] || 0) + 1;
    }
  });

  const topDestination =
    Object.keys(destinationCount).length > 0
      ? Object.entries(destinationCount).sort((a, b) => b[1] - a[1])[0][0]
      : "N/A";

  const lastBoxAdded = [...boxes]
    .filter((b) => b.createdAt)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
      icon: Ruler,
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

        <div className="grid grid-cols-2 gap-3 mt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stats.map(({ id, label, value, description, icon: Icon }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="flex flex-col justify-between p-5 transition-all duration-300 bg-gray-900 border border-gray-800 shadow-lg cursor-pointer rounded-2xl hover:shadow-xl hover:border-gray-700"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-800 border border-gray-700 shadow-inner rounded-xl">
                  <Icon
                    size={26}
                    strokeWidth={1.3}
                    className="text-yellow-400"
                  />
                </div>
              </div>

              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {value}
              </p>

              <p className="mt-2 text-xs text-gray-500">{description}</p>
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
