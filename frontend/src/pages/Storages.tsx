import { useState, useEffect, useRef } from "react";
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
  const [scrolled, setScrolled] = useState(false);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // --- Données de test ---
  const storageData: Storage[] = [
    {
      _id: "s1",
      name: "Garage Maison",
      address: "12 Rue des Peupliers, Rennes",
      boxes: [
        { id: "A1", label: "Vêtements hiver" },
        { id: "A2", label: "Livres anciens" },
        { id: "A3", label: "Jouets enfants" },
      ],
      ownerId: "user123",
    },
    {
      _id: "s2",
      name: "Cave Immeuble",
      address: "8 Avenue du Général, Nantes",
      boxes: [{ id: "B1", label: "Décos Noël" }],
      ownerId: "user123",
    },
    {
      _id: "s3",
      name: "Box de stockage - Saint-Malo",
      address: "Parc Logistique, Saint-Malo",
      boxes: [],
      ownerId: "user123",
    },
    {
      _id: "s4",
      name: "Grenier principal",
      address: "5 Rue des Lilas, Laval",
      boxes: [
        { id: "C1", label: "Souvenirs famille" },
        { id: "C2", label: "Vieux magazines" },
        { id: "C3", label: "Cartons déménagement" },
        { id: "C4", label: "Vêtements bébé" },
      ],
      ownerId: "user123",
    },
    {
      _id: "s5",
      name: "Atelier de bricolage",
      address: "Rue des Artisans, Vannes",
      boxes: [
        { id: "D1", label: "Outils" },
        { id: "D2", label: "Peintures" },
        { id: "D3", label: "Accessoires jardin" },
      ],
      ownerId: "user123",
    },
    {
      _id: "s6",
      name: "Entrepôt secondaire",
      address: "Zone Industrielle Sud, Rennes",
      boxes: [
        { id: "E1", label: "Décors cinéma" },
        { id: "E2", label: "Mobilier expo" },
        { id: "E3", label: "Matériel son" },
        { id: "E4", label: "Projecteurs" },
        { id: "E5", label: "Câbles" },
      ],
      ownerId: "user123",
    },
    {
      _id: "s7",
      name: "Hangar agricole",
      address: "Chemin des Champs, Fougères",
      boxes: [
        { id: "F1", label: "Matériel jardin" },
        { id: "F2", label: "Graines" },
        { id: "F3", label: "Sacs de terreau" },
        { id: "F4", label: "Outils agricoles" },
        { id: "F5", label: "Pièces détachées" },
        { id: "F6", label: "Peinture bois" },
      ],
      ownerId: "user123",
    },
    {
      _id: "s8",
      name: "Abri extérieur",
      address: "Jardin de la maison, Quimper",
      boxes: [],
      ownerId: "user123",
    },
    {
      _id: "s9",
      name: "Studio photo",
      address: "Rue des Lumières, Brest",
      boxes: [
        { id: "H1", label: "Trépieds" },
        { id: "H2", label: "Toiles de fond" },
        { id: "H3", label: "Éclairages" },
      ],
      ownerId: "user123",
    },
    {
      _id: "s10",
      name: "Stock événementiel",
      address: "Zone Expo, Lorient",
      boxes: [
        { id: "I1", label: "Stands pliables" },
        { id: "I2", label: "Bannières" },
        { id: "I3", label: "Affiches" },
        { id: "I4", label: "Guirlandes LED" },
      ],
      ownerId: "user123",
    },
    {
      _id: "s11",
      name: "Garage secondaire",
      address: "Rue du Stade, Rennes",
      boxes: [{ id: "J1", label: "Pneus hiver" }],
      ownerId: "user123",
    },
    {
      _id: "s12",
      name: "Cave à vin",
      address: "4 Rue des Vignes, Nantes",
      boxes: [
        { id: "K1", label: "Vins rouges" },
        { id: "K2", label: "Vins blancs" },
        { id: "K3", label: "Champagnes" },
      ],
      ownerId: "user123",
    },
    {
      _id: "s13",
      name: "Local associatif",
      address: "Centre culturel, Vitré",
      boxes: [
        { id: "L1", label: "Matériel de scène" },
        { id: "L2", label: "Costumes" },
      ],
      ownerId: "user123",
    },
    {
      _id: "s14",
      name: "Entrepôt principal",
      address: "Route de Paris, Rennes",
      boxes: [
        { id: "M1", label: "Stock produits" },
        { id: "M2", label: "Échantillons" },
        { id: "M3", label: "Documents administratifs" },
        { id: "M4", label: "Archives" },
      ],
      ownerId: "user123",
    },
    {
      _id: "s15",
      name: "Box temporaire",
      address: "Allée du Port, Saint-Brieuc",
      boxes: [],
      ownerId: "user123",
    },
  ];

  // --- Filtrage & tri ---
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

  // --- calcul dynamique du padding-top du contenu pour éviter le chevauchement ---
  const updateContentOffset = () => {
    const headerHeight = headerRef.current?.offsetHeight ?? 0;
    if (contentRef.current) {
      contentRef.current.style.paddingTop = `${headerHeight + 16}px`; // +16 pour un peu d'air
    }
  };

  useEffect(() => {
    // resize observer + window resize fallback
    updateContentOffset();
    const ro = new ResizeObserver(() => updateContentOffset());
    if (headerRef.current) ro.observe(headerRef.current);
    window.addEventListener("resize", updateContentOffset);
    const onScroll = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", onScroll);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateContentOffset);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <PageWrapper>
      <div className="relative min-h-screen text-white">
        {/* ---------- Fixed header (toujours visible) ---------- */}
        <div
          ref={headerRef}
          className={`fixed left-0 right-0 top-0 z-50 px-6 py-4 border-b transition-all duration-200 ${
            !scrolled
              ? "bg-gray-950/40 backdrop-blur-md shadow-lg border-gray-700"
              : "bg-gray-950 border-gray-800"
          }`}
        >
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-1 text-white bg-gray-800 border border-gray-700 rounded-lg text-md focus:outline-none focus:ring-1 focus:ring-yellow-400"
              aria-label="Rechercher des entrepôts"
            />
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-black transition bg-yellow-400 rounded-lg hover:bg-yellow-500"
              aria-label="Ajouter un entrepôt"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 mt-3">
            <div className="relative flex-3/5">
              <select
                value={sortMode}
                onChange={(e) =>
                  setSortMode(e.target.value as "name" | "boxCount")
                }
                className="w-full px-3 py-2 pr-10 text-sm text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:bg-gray-700"
                aria-label="Trier les entrepôts"
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
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm transition-colors bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-yellow-400"
              aria-pressed={!ascending}
            >
              <ArrowUpDown size={16} />
              {ascending ? "Croissant" : "Décroissant"}
            </button>
          </div>
        </div>

        {/* ---------- Contenu principal (scrollable via body) ---------- */}
        <main ref={contentRef} className="max-w-4xl px-6 pb-20 mx-auto">
          <div className="pt-6 space-y-4">
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
                    <button
                      className="p-2 transition-colors rounded hover:bg-gray-700"
                      aria-label={`Éditer ${storage.name}`}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className="p-2 transition-colors rounded hover:bg-red-700"
                      aria-label={`Supprimer ${storage.name}`}
                    >
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

          <p className="pb-6 mt-10 text-sm text-center text-gray-500">
            Liste de vos entrepôts.
          </p>
        </main>
      </div>
    </PageWrapper>
  );
};

export default Storages;
