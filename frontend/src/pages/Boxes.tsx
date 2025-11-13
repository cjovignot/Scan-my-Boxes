import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { motion } from "framer-motion";
import { Pencil, Trash, Plus, ArrowUpDown, ChevronDown } from "lucide-react";

// =====================================
// 🔹 Types
// =====================================
type ContentItem = {
  name: string;
  quantity: number;
  picture?: string;
};

type Box = {
  _id: string;
  ownerId: string;
  storageId: string;
  number: string;
  content: ContentItem[];
  destination: string;
  qrcodeURL: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
};

type Storage = {
  _id: string;
  name: string;
};

// =====================================
// 🔹 Composant principal
// =====================================
const Boxes = () => {
  const navigate = useNavigate();
  const [boxes, setBoxes] = useState<Box[] | null>(null);
  const [storages, setStorages] = useState<Storage[] | null>(null);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<"destination" | "objectCount">(
    "destination"
  );
  const [ascending, setAscending] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // =====================================
  // 🔹 Fetch des boîtes de l’utilisateur
  // =====================================
  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const res = await fetch(`${API_URL}/api/boxes?ownerId=${user._id}`);
        if (!res.ok)
          throw new Error("Erreur réseau lors du chargement des boîtes");
        const data = await res.json();
        setBoxes(data);
      } catch (err) {
        console.error(err);
        setBoxes([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchBoxes();
    else setBoxes([]);
  }, [API_URL, user?._id]);

  // =====================================
  // 🔹 Fetch des entrepôts
  // =====================================
  useEffect(() => {
    const fetchStorages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/storages?ownerId=${user._id}`);
        if (!res.ok)
          throw new Error("Erreur réseau lors du chargement des entrepôts");
        const data = await res.json();
        setStorages(data);
      } catch (err) {
        console.error(err);
        setStorages([]);
      }
    };

    if (user?._id) fetchStorages();
    else setStorages([]);
  }, [API_URL, user?._id]);

  // =====================================
  // 🔹 Suppression d’une boîte
  // =====================================
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette boîte ?")) return;

    try {
      const res = await fetch(`${API_URL}/api/boxes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      setBoxes((prev) => (prev ? prev.filter((box) => box._id !== id) : []));
    } catch (err) {
      console.error("❌ Erreur suppression boîte :", err);
      alert("Impossible de supprimer la boîte.");
    }
  };

  // =====================================
  // 🔹 Filtrage + tri
  // =====================================
  const safeBoxes = Array.isArray(boxes) ? boxes : [];
  const safeStorages = Array.isArray(storages) ? storages : [];

  const filteredBoxes = safeBoxes
    .filter((box) =>
      search === ""
        ? true
        : box.content.some((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
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

  // =====================================
  // 🔹 Ajustement du header
  // =====================================
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

  // =====================================
  // 🔹 Helper : retrouver le nom d’un entrepôt
  // =====================================
  const getStorageName = (id: string) =>
    safeStorages.find((s) => s._id === id)?.name || "Inconnu";

  // =====================================
  // 🔹 Rendu
  // =====================================
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
              Mes boîtes
            </h1>
          </motion.div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Rechercher par objet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-1 text-white bg-gray-800 border border-gray-700 rounded-lg text-md focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
            <button
              onClick={() => navigate("/boxes/new")}
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
        </div>

        {/* ---------- Contenu ---------- */}
        <main ref={contentRef} className="max-w-4xl px-6 pb-20 mx-auto">
          {loading ? (
            <p className="pt-20 text-center text-gray-400">
              Chargement des boîtes...
            </p>
          ) : filteredBoxes.length === 0 ? (
            <p className="pt-20 text-center text-gray-500">
              Aucune boîte trouvée.
            </p>
          ) : (
            <div className="pt-2 space-y-4">
              {filteredBoxes.map((box) => (
                <div
                  key={box._id}
                  className="relative flex flex-col p-4 transition-colors bg-gray-800 border border-gray-700 cursor-pointer rounded-xl hover:bg-gray-700"
                  onClick={() => navigate(`/box/boxdetails/${box._id}`)}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-yellow-400">
                      {box.number}
                    </h2>

                    <div className="flex items-center gap-3">
                      {/* <button
                        className="p-2 transition-colors rounded hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/boxes/edit/${box._id}`);
                        }}
                      >
                        <Pencil size={18} />
                      </button> */}
                      <button
                        className="p-2 transition-colors rounded hover:bg-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(box._id);
                        }}
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400">
                    Destination :{" "}
                    <span className="font-medium text-yellow-400">
                      {box.destination}
                    </span>
                  </p>

                  <p className="text-sm text-gray-400">
                    Entrepôt :{" "}
                    <span className="font-medium text-yellow-400">
                      {getStorageName(box.storageId)}
                    </span>
                  </p>

                  <p className="text-sm text-gray-400">
                    Objets :{" "}
                    <span className="font-medium text-yellow-400">
                      {box.content.length}
                    </span>
                  </p>

                  <p className="text-sm text-gray-400">
                    Dimensions :{" "}
                    <span className="font-medium text-yellow-400">
                      {box.dimensions.width}×{box.dimensions.height}×
                      {box.dimensions.depth} cm
                    </span>
                  </p>

                  {box.qrcodeURL && (
                    <img
                      src={box.qrcodeURL}
                      alt="QR Code"
                      className="absolute object-contain w-16 h-16 p-1 transition-opacity border border-gray-600 rounded-md bottom-2 right-2 opacity-80 hover:opacity-100 bg-gray-900/40"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="pb-6 mt-10 text-sm text-center text-gray-500">
            Liste de vos boîtes.
          </p>
        </main>
      </div>
    </PageWrapper>
  );
};

export default Boxes;
