import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { motion } from "framer-motion";
import { Pencil, Trash, Plus, ArrowUpDown, ChevronDown } from "lucide-react";

type Storage = {
  _id: string;
  name: string;
  address: string;
  boxes: { id: string; label: string }[];
  ownerId: string;
};

const Storages = () => {
  const navigate = useNavigate();
  const [storages, setStorages] = useState<Storage[]>([]);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<"name" | "boxCount">("name");
  const [ascending, setAscending] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const API_URL = import.meta.env.VITE_API_URL; // ✅ récupère depuis .env
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // --- Récupération des entrepôts depuis le backend ---
  useEffect(() => {
    const fetchStorages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/storages?ownerId=${user._id}`);
        if (!res.ok) throw new Error("Erreur réseau");
        const data = await res.json();
        setStorages(data);
      } catch (err) {
        console.error("Erreur lors du chargement des entrepôts :", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchStorages();
  }, [API_URL, user]);

  // --- Filtrage & tri ---
  const filtered = storages
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

  // --- Ajustement du padding ---
  const updateContentOffset = () => {
    const headerHeight = headerRef.current?.offsetHeight ?? 0;
    if (contentRef.current) {
      contentRef.current.style.paddingTop = `${headerHeight + 16}px`;
    }
  };

  useEffect(() => {
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
        {/* ---------- Header ---------- */}
        <div
          ref={headerRef}
          className={`fixed left-0 right-0 top-0 z-50 px-6 py-4 border-b transition-all duration-200 ${
            !scrolled
              ? "bg-gray-950/40 backdrop-blur-md shadow-lg border-gray-700"
              : "bg-gray-950 border-gray-800"
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md mb-2"
          >
            <h1 className="mt-2 text-2xl font-semibold text-yellow-400">
              Mes entrepôts
            </h1>
          </motion.div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-1 text-white bg-gray-800 border border-gray-700 rounded-lg text-md focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
            <button
              onClick={() => navigate("/storages/new")}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-black transition bg-yellow-400 rounded-lg hover:bg-yellow-500"
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
            >
              <ArrowUpDown size={16} />
              {ascending ? "Croissant" : "Décroissant"}
            </button>
          </div>
        </div>

        {/* ---------- Contenu ---------- */}
        <main ref={contentRef} className="max-w-4xl px-6 pb-20 mx-auto">
          {loading ? (
            <p className="pt-20 text-center text-gray-400">
              Chargement des entrepôts...
            </p>
          ) : filtered.length === 0 ? (
            <p className="pt-20 text-center text-gray-500">
              Aucun entrepôt trouvé.
            </p>
          ) : (
            <div className="pt-2 space-y-4">
              {filtered.map((storage) => (
                <div
                  key={storage._id}
                  className="flex flex-col p-4 bg-gray-800 border border-gray-700 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-yellow-400">
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
                      {storage.boxes?.length ?? 0}
                    </span>{" "}
                    boîte(s)
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="pb-6 mt-10 text-sm text-center text-gray-500">
            Liste de vos entrepôts.
          </p>
        </main>
      </div>
    </PageWrapper>
  );
};

export default Storages;
