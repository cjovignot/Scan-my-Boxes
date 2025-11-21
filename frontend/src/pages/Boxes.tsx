import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import BoxItem from "../components/BoxItem";
import { motion } from "framer-motion";
import {
  Plus,
  ArrowUpDown,
  ArrowDownUp,
  ChevronDown,
  AlertTriangle,
  Boxes as StorageIcon,
} from "lucide-react";
import { useAuth } from "../contexts/useAuth";

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
  fragile: boolean;
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

const Boxes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [boxes, setBoxes] = useState<Box[] | null>(null);
  const [storages, setStorages] = useState<Storage[] | null>(null);
  const [search, setSearch] = useState("");
  const [sortByNumber, setSortByNumber] = useState<"asc" | "desc" | null>(
    "asc"
  );
  const [filterFragile, setFilterFragile] = useState<
    "all" | "fragile" | "nonFragile"
  >("all");
  const [filterStorage, setFilterStorage] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // 🚨 Aucun utilisateur connecté
  if (!user?._id) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-white">
          <h2 className="mb-4 text-2xl font-bold text-yellow-400">
            Vous n’êtes pas connecté
          </h2>
          <p className="mb-6 text-center text-gray-400">
            Pour consulter vos boîtes, merci de créer un compte ou de vous
            connecter.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 text-black bg-yellow-400 rounded-full hover:bg-yellow-500"
          >
            Se connecter / Créer un compte
          </button>
        </div>
      </PageWrapper>
    );
  }

  // 🔹 Fetch des boîtes
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
    fetchBoxes();
  }, [API_URL, user._id]);

  // 🔹 Fetch des entrepôts
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
    fetchStorages();
  }, [API_URL, user._id]);

  // 🔹 Suppression d’une boîte
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

  // 🔹 Filtrage + tri
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
    .filter((box) => {
      if (filterFragile === "fragile") return box.fragile === true;
      if (filterFragile === "nonFragile") return box.fragile === false;
      return true;
    })
    .filter((box) => {
      if (filterStorage === "all") return true;
      if (filterStorage === "none") return !box.storageId;
      return box.storageId === filterStorage;
    })
    .sort((a, b) => {
      if (sortByNumber) {
        return sortByNumber === "asc"
          ? a.number.localeCompare(b.number)
          : b.number.localeCompare(a.number);
      }
      return 0;
    });

  // 🔹 Ajustement du header
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
    const onScroll = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", updateContentOffset);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateContentOffset);
    };
  }, []);

  // 🔹 Helper : retrouver le nom d’un entrepôt
  const getStorageName = (id: string) =>
    safeStorages.find((s) => s._id === id)?.name || "Inconnu";

  // 🔹 Rendu
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

          <div className="flex items-center gap-3 mt-3">
            <div className="relative flex items-center">
              <StorageIcon
                size={16}
                className="absolute text-yellow-400 left-3"
              />
              <select
                value={filterStorage}
                onChange={(e) => setFilterStorage(e.target.value)}
                className="w-full py-2 pl-8 pr-10 text-sm text-white bg-gray-800 border border-gray-700 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:bg-gray-700"
              >
                <option value="all">Tous</option>
                <option value="none">Sans entrepôt</option>
                {safeStorages.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2"
              />
            </div>

            <div className="relative flex items-center">
              <AlertTriangle
                size={16}
                className="absolute text-red-400 left-3"
              />
              <select
                value={filterFragile}
                onChange={(e) =>
                  setFilterFragile(
                    e.target.value as "all" | "fragile" | "nonFragile"
                  )
                }
                className="w-full py-2 pl-8 pr-10 text-sm text-white bg-gray-800 border border-gray-700 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:bg-gray-700"
              >
                <option value="all">Tous</option>
                <option value="fragile">Fragile</option>
                <option value="nonFragile">Non fragile</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2"
              />
            </div>

            <button
              onClick={() =>
                setSortByNumber((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm transition-colors bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-yellow-400"
            >
              {sortByNumber === "asc" ? (
                <ArrowUpDown size={16} />
              ) : (
                <ArrowDownUp size={16} />
              )}
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
                <BoxItem
                  key={box._id}
                  box={box}
                  onClick={() => navigate(`/box/boxdetails/${box._id}`)}
                  onDelete={() => handleDelete(box._id)}
                  getStorageName={getStorageName}
                />
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
