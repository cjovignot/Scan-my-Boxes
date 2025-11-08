import { useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { Pencil, Trash, Plus, ArrowUpDown, ChevronDown } from "lucide-react";

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
      boxes: [
        { id: "A1", label: "Vêtements" },
        { id: "A2", label: "Livres" },
      ],
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
      return ascending
        ? a.boxes.length - b.boxes.length
        : b.boxes.length - a.boxes.length;
    });

  return (
    <PageWrapper>
      <div className="flex flex-col px-6 py-10 text-white">
        <h1 className="mb-10 text-4xl font-bold text-center text-yellow-400">
          Entrepôts
        </h1>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 mb-4 text-white bg-gray-800 border border-gray-700 rounded-lg flex-5/6 text-md focus:outline-none focus:ring-1 focus:ring-yellow-400"
          />

          <button className="flex items-center justify-center w-full gap-2 px-4 py-2 mb-4 text-sm font-medium text-black bg-yellow-400 rounded-lg flex-1/6">
            <Plus size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-3/5">
            <select
              value={sortMode}
              onChange={(e) =>
                setSortMode(e.target.value as "name" | "boxCount")
              }
              className="w-full px-3 py-2 pr-10 text-sm text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:bg-gray-700"
            >
              <option value="name">Nom alphabétique</option>
              <option value="boxCount">Nombre de boîtes</option>
            </select>

            <ChevronDown
              size={16}
              className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2"
            />
          </div>

          <button
            onClick={() => setAscending(!ascending)}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm transition-colors bg-gray-800 border border-gray-700 rounded-lg flex-2/5 hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-yellow-400"
          >
            <ArrowUpDown size={16} />
            {ascending ? "Croissant" : "Décroissant"}
          </button>
        </div>
        {/* 🔸 Séparateur stylé */}
        <div className="w-full my-4">
          <div className="w-full border-t border-gray-700" />
        </div>

        <div className="flex flex-col w-full gap-4">
          {filtered.map((storage) => (
            <div
              key={storage._id}
              className="flex flex-col p-4 bg-gray-800 border border-gray-700 rounded-xl"
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
