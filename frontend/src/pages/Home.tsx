import { useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { Pencil, Trash, Plus, ArrowUpDown, ChevronDown } from "lucide-react";

type Box = {
  _id: string;
  ownerId: string;
  storageId: string;
  content: string[];
  destination: string;
  qrcodeURL: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
};

// 🔹 Simulation de données
const mockBoxes: Box[] = [
  {
    _id: "box1",
    ownerId: "user123",
    storageId: "storageA",
    content: ["T-shirt", "Chaussures", "Livre"],
    destination: "Paris",
    qrcodeURL: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=box1",
    dimensions: { width: 40, height: 30, depth: 20 },
  },
  {
    _id: "box2",
    ownerId: "user123",
    storageId: "storageB",
    content: ["Vase", "Couverture"],
    destination: "Lyon",
    qrcodeURL: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=box2",
    dimensions: { width: 50, height: 25, depth: 25 },
  },
  {
    _id: "box3",
    ownerId: "user123",
    storageId: "storageC",
    content: ["Chaise", "Tablette", "Lampe"],
    destination: "Bordeaux",
    qrcodeURL: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=box3",
    dimensions: { width: 60, height: 40, depth: 30 },
  },
];

const Home = () => {
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<"destination" | "objectCount">(
    "destination"
  );
  const [ascending, setAscending] = useState(true);

  const filteredBoxes = mockBoxes
    .filter((box) =>
      box.content.some((item) =>
        item.toLowerCase().includes(search.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (sortMode === "destination") {
        return ascending
          ? a.destination.localeCompare(b.destination)
          : b.destination.localeCompare(a.destination);
      } else {
        return ascending
          ? a.content.length - b.content.length
          : b.content.length - a.content.length;
      }
    });

  return (
    <PageWrapper>
      <div className="flex flex-col px-6 py-10 text-white">
        <h1 className="mb-10 text-4xl font-bold text-center text-yellow-400">
          📦 Mes boîtes
        </h1>

        {/* Barre de recherche + bouton création */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Rechercher un objet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 mb-4 text-white bg-gray-800 border border-gray-700 rounded-lg text-md focus:outline-none focus:ring-1 focus:ring-yellow-400"
          />

          <button className="flex items-center justify-center w-full gap-2 px-4 py-2 mb-4 text-sm font-medium text-black bg-yellow-400 rounded-lg">
            <Plus size={18} />
          </button>
        </div>

        {/* Sélection de tri */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-3/5">
            <select
              value={sortMode}
              onChange={(e) =>
                setSortMode(e.target.value as "destination" | "objectCount")
              }
              className="w-full px-3 py-2 pr-10 text-sm text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:bg-gray-700"
            >
              <option value="destination">Destination alphabétique</option>
              <option value="objectCount">Nombre d’objets</option>
            </select>

            <ChevronDown
              size={16}
              className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2"
            />
          </div>

          <button
            onClick={() => setAscending(!ascending)}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm transition-colors bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-yellow-400"
          >
            <ArrowUpDown size={16} />
            {ascending ? "Croissant" : "Décroissant"}
          </button>
        </div>

        {/* Séparateur */}
        <div className="w-full my-4">
          <div className="w-full border-t border-gray-700" />
        </div>

        {/* Liste des boîtes */}
        <div className="flex flex-col w-full gap-4">
          {filteredBoxes.map((box) => (
            <div
              key={box._id}
              className="flex flex-col p-4 bg-gray-800 border border-gray-700 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-yellow-300">
                  {box.destination}
                </h2>

                <div className="flex items-center gap-3">
                  <button className="p-2 transition-colors rounded hover:bg-gray-700">
                    <Pencil size={18} />
                  </button>
                  <button className="p-2 transition-colors rounded hover:bg-red-700">
                    <Trash size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-2 text-sm text-gray-300">
                <span className="font-medium text-yellow-400">
                  {box.content.length}
                </span>{" "}
                objet(s)
              </div>

              <div className="mt-2">
                <img
                  src={box.qrcodeURL}
                  alt={`QR Code for box ${box._id}`}
                  className="w-24 h-24"
                />
              </div>
            </div>
          ))}

          {filteredBoxes.length === 0 && (
            <p className="text-center text-gray-400">Aucun objet trouvé.</p>
          )}
        </div>

        <p className="mt-10 text-sm text-center text-gray-500">
          Liste de vos boîtes.
        </p>
      </div>
    </PageWrapper>
  );
};

export default Home;