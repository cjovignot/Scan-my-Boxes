import PageWrapper from "../components/PageWrapper";
import {
  Warehouse,
  Boxes,
  Ruler,
  Tag,
  Clock,
  PackageSearch,
} from "lucide-react";

type Box = {
  _id: string;
  ownerId: string;
  storageId: string;
  number: string;
  content: string[];
  destination: string;
  qrcodeURL: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
};

// 🔹 Simulation de données (sera remplacé par le back plus tard)
const mockBoxes: Box[] = [
  {
    _id: "box1",
    ownerId: "user123",
    storageId: "storageA",
    number: "001",
    content: ["T-shirt", "Chaussures", "Livre"],
    destination: "Chambre",
    qrcodeURL:
      "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=box1",
    dimensions: { width: 40, height: 30, depth: 20 },
  },
  {
    _id: "box2",
    ownerId: "user123",
    storageId: "storageB",
    number: "002",
    content: ["Vase", "Plaid", "Bougie", "Cadre"],
    destination: "Salon",
    qrcodeURL:
      "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=box2",
    dimensions: { width: 50, height: 25, depth: 25 },
  },
  {
    _id: "box3",
    ownerId: "user123",
    storageId: "storageC",
    number: "003",
    content: ["Chaise", "Tablette", "Lampe", "Coussin", "Tapis"],
    destination: "Salon",
    qrcodeURL:
      "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=box3",
    dimensions: { width: 60, height: 40, depth: 30 },
  },
];

const Dashboard = () => {
  // 🔸 Calculs de base
  const totalWarehouses = new Set(mockBoxes.map((b) => b.storageId)).size;
  const totalBoxes = mockBoxes.length;
  const totalVolumeCm3 = mockBoxes.reduce(
    (sum, b) =>
      sum + b.dimensions.width * b.dimensions.height * b.dimensions.depth,
    0
  );
  const totalVolumeM3 = totalVolumeCm3 / 1_000_000;

  // 🔹 Nouveaux KPI
  const totalObjects = mockBoxes.reduce((sum, b) => sum + b.content.length, 0);
  const avgBoxesPerWarehouse =
    totalWarehouses > 0 ? totalBoxes / totalWarehouses : 0;
  const avgVolumePerBox = totalBoxes > 0 ? totalVolumeM3 / totalBoxes : 0;

  // Trouver la destination la plus fréquente
  const destinationCount: Record<string, number> = {};
  mockBoxes.forEach((b) => {
    destinationCount[b.destination] =
      (destinationCount[b.destination] || 0) + 1;
  });
  const topDestination =
    Object.keys(destinationCount).length > 0
      ? Object.entries(destinationCount).sort((a, b) => b[1] - a[1])[0][0]
      : "N/A";

  // Dernière boîte ajoutée (simulation)
  const lastBoxAdded = mockBoxes[mockBoxes.length - 1];

  // 🔹 Configuration des cartes (facile à étendre)
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
      value: `#${lastBoxAdded.number} (${lastBoxAdded.destination})`,
      description: "Dernière boîte ajoutée",
      icon: Clock,
    },
  ];

  return (
    <PageWrapper>
      <div className="flex flex-col px-6 py-10 text-white">
        <h1 className="mb-20 text-4xl font-bold text-center text-yellow-400">
          📊 Tableau de bord
        </h1>

        {/* Section des cartes de stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stats.map(({ id, label, value, description, icon: Icon }) => (
            <div
              key={id}
              className="flex flex-col items-start justify-between p-4 transition-all duration-200 bg-gray-800 border border-gray-700 rounded-2xl hover:bg-gray-700 hover:scale-[1.02]"
            >
              <div className="flex flex-col items-start w-full">
                <Icon size={26} className="text-yellow-400" />
                <h2 className="mt-2 font-semibold text-right text-yellow-400 text-md">
                  {label}
                </h2>
              </div>
              <p className="mt-1 text-lg font-bold break-words">{value}</p>
              <p className="mt-1 text-xs text-gray-400">{description}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-10 text-sm text-center text-gray-500">
          Aperçu global de votre activité.
        </p>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
