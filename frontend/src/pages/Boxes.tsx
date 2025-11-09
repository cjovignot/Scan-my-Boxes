import { useState, useEffect, useRef } from "react";
import PageWrapper from "../components/PageWrapper";
import { Pencil, Trash, Plus, ArrowUpDown, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { useApiMutation } from "../hooks/useApiMutation";

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

const Boxes = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<"destination" | "objectCount">(
    "destination"
  );
  const [ascending, setAscending] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // ============================
  // 🔹 Récupération des boîtes
  // ============================
  const { data: boxes, loading, error, refetch } = useApi<Box[]>("/api/boxes");

  // ============================
  // 🔹 Récupération des entrepôts
  // ============================
  const { data: storages } = useApi<Storage[]>("/api/storages");

  // ============================
  // 🔹 Mutation : suppression d’une boîte
  // ============================
  const { mutate: deleteBox, loading: deleting } = useApiMutation<
    { success: boolean },
    void
  >("/api/boxes", "DELETE", {
    onSuccess: () => {
      refetch();
    },
    onError: (err) => {
      console.error("Erreur suppression boîte :", err);
      alert("❌ Impossible de supprimer la boîte");
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette boîte ?")) return;
    await deleteBox(undefined, { url: `/api/boxes/${id}` });
  };

  // ============================
  // 🔹 Filtrage + tri
  // ============================
  const filteredBoxes =
    boxes
      ?.filter((box) =>
        box.content.some((item) =>
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
      }) ?? [];

  // ============================
  // 🔹 Gestion du scroll & header sticky
  // ============================
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

    const content = contentRef.current;
    const onScroll = () => {
      if (content) setScrolled(content.scrollTop > 0);
    };
    content?.addEventListener("scroll", onScroll);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateContentOffset);
      content?.removeEventListener("scroll", onScroll);
    };
  }, []);

  // ============================
  // 🔹 Helper : retrouver le nom d’un entrepôt
  // ============================
  const getStorageName = (id: string) =>
    storages?.find((s) => s._id === id)?.name || "Inconnu";

  // ============================
  // 🔹 Rendu
  // ============================
  return (
    <PageWrapper>
      <div className="relative min-h-screen text-white">
        {/* ---------- Fixed Header ---------- */}
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
              placeholder="Rechercher par objet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-1 text-white bg-gray-800 border border-gray-700 rounded-lg text-md focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
            <button
              onClick={() => navigate("/boxes/new")}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-black transition bg-yellow-400 rounded-lg hover:bg-yellow-500"
              aria-label="Ajouter une boîte"
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
              aria-pressed={!ascending}
            >
              <ArrowUpDown size={16} />
              {ascending ? "Croissant" : "Décroissant"}
            </button>
          </div>
        </div>

        {/* ---------- Contenu principal ---------- */}
        <main
          ref={contentRef}
          className="w-full max-w-screen-xl px-6 pb-20 mx-auto overflow-y-auto hide-scrollbar"
        >
          <div className="pt-6 space-y-4">
            {loading ? (
              <p className="text-center text-gray-400">Chargement...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : filteredBoxes.length > 0 ? (
              filteredBoxes.map((box) => (
                <div
                  key={box._id}
                  className="flex flex-col p-4 bg-gray-800 border border-gray-700 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-yellow-300">
                      {box.number}
                    </h2>
                    <div className="flex items-center gap-3">
                      <button
                        className="p-2 transition-colors rounded hover:bg-gray-700"
                        onClick={() => navigate(`/boxes/edit/${box._id}`)}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className="p-2 transition-colors rounded hover:bg-red-700"
                        disabled={deleting}
                        onClick={() => handleDelete(box._id)}
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-gray-400">
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

                  <p className="mt-2 text-sm text-gray-400">
                    Dimensions :{" "}
                    <span className="font-medium text-yellow-400">
                      {box.dimensions.width}×{box.dimensions.height}×
                      {box.dimensions.depth} cm
                    </span>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400">Aucune boîte trouvée.</p>
            )}
          </div>

          <p className="pb-6 mt-10 text-sm text-center text-gray-500">
            Liste de vos boîtes.
          </p>
        </main>
      </div>
    </PageWrapper>
  );
};

export default Boxes;
