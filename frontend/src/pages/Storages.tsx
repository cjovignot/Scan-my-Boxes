import { useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { Pencil, Trash, Plus, ArrowUpDown } from "lucide-react";

type Storage = {
  _id: string;
  name: string;
  address: string;
  boxes: { id: string; label: string }[];
  ownerId: string;
};

const Storages = () => {
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<"name" | "boxCount">("name");
  const [ascending, setAscending] = useState(true);

  const storageData: Storage[] = [
    {
      _id: "6743bdc7f1a3c2a91e15d9aa",
      name: "Garage Maison",
      address: "12 Rue des Peupliers, Rennes",
      boxes: [{ id: "A1", label: "Vêtements" }, { id: "A2", label: "Livres" }],
      ownerId: "user123",
    },
    {
      _id: "6743bdc7f1a3c2a91e15d9ab",
      name: "Cave Immeuble",
      address: "8 Avenue du Général, Nantes",
      boxes: [{ id: "B1", label: "Décos Noël" }],
      ownerId: "user123",
    },
    {
      _id: "6743bdc7f1a3c2a91e15d9ac",
      name: "Box de stockage",
      address: "Parc Logistique, Saint-Malo",
      boxes: [],
      ownerId: "user123",
    },
  ];

  const filtered = storageData
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortMode === "name") {
        return ascending
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortMode === "boxCount") {
        return ascending
          ? a.boxes.length - b.boxes.length
          : b.boxes.length - a.boxes.length;
      }
      return 0;
    });

  return (
    <PageWrapper>
      <div className="flex flex-col px-6 py-10 text-white">

        <h1 className="mb-6 text-4xl font-bold text-center text-yellow-400">
          Entrepôts
        </h1>

        {/* Barre de recherche */}
        <input
          type="text"
          placeholder="Rechercher par nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 mb-4 text-sm text-white bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-400"
        />

        {/* Tri + ordre */}
        <div className="flex items-center justify-between mb-6">
          {/* Sélecteur de mode tri */}
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as "name" | "boxCount")}
            className="px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-400"
          >
            <option value="name">Nom (A → Z)</option>
            <option value="boxCount">Nombre de boîtes</option>
          </select>

          {/* Toggle d'ordre */}
          <button
            onClick={() => setAscending(!ascending)}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700"
          >
            <ArrowUpDown size={16} />
            {ascending ? "Croissant" : "Décroissant"}
          </button>
        </div>

        {/* Bouton Ajouter */}
        <button className="flex items-center justify-center w-full gap-2 px-4 py-2 mb-6 text-sm font-medium text-black bg-yellow-400 rounded-lg">
          <Plus size={18} />
          Ajouter un entrepôt
        </button>

        {/* Liste */}
        <div className="flex flex-col w-full gap-4">
          {filtered.map((storage) => (
            <div
              key={storage._id}
              className="flex flex-col p-4 bg-gray-800 rounded-xl border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-yellow-300">
                  {storage.name}
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

              <p className="text-sm text-gray-400">{storage.address}</p>

              <div className="mt-3 text-sm text-gray-300">
                <span className="font-medium text-yellow-400">
                  {storage.boxes.length}
                </span>{" "}
                boîte(s) stockée(s)
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-center text-gray-500">
          Liste de vos entrepôts.
        </p>
      </div>
    </PageWrapper>
  );
};

export default Storages;