// frontend/src/pages/boxes/BoxDetails.tsx
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCloudinaryImage } from "../../hooks/useCloudinaryImage";
import BoxDetailsItem from "../../components/boxDetailsItem";
import {
  ArrowLeft,
  AlertTriangle,
  Edit3,
  Plus,
  Minus,
  X,
  Printer,
} from "lucide-react";
import { motion } from "framer-motion";
import { useApi } from "../../hooks/useApi";
import { usePrint } from "../../hooks/usePrint";
import * as htmlToImage from "html-to-image";
import { useAuth } from "../../contexts/useAuth";

interface ContentItem {
  _id: string;
  name: string;
  quantity?: number;
  picture?: string;
}

interface Box {
  _id: string;
  number: string;
  destination: string;
  storageId: string;
  content: ContentItem[];
  fragile?: boolean;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  qrcodeURL?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Storage {
  _id: string;
  name: string;
}

const BoxDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const labelRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth(); // 🔹 utilisation du contexte Auth
  const API_URL = import.meta.env.VITE_API_URL;

  const {
    data: box,
    loading,
    error,
    refetch,
  } = useApi<Box>(`/api/boxes/${id}`, { skip: !id });

  const { selectedBoxes, toggleBox } = usePrint();

  const isSelected = box ? selectedBoxes.includes(box._id) : false;

  const [storageName, setStorageName] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [labelImage, setLabelImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const { src: qrOptimized } = useCloudinaryImage(box?.qrcodeURL, { w: 300 });

  // 🔹 Refetch automatique si l'id change
  useEffect(() => {
    if (id) refetch();
  }, [id, refetch]);

  // 🔹 Récupération nom de l'entrepôt
  useEffect(() => {
    const fetchStorageName = async () => {
      if (!box?.storageId || !user?._id) return;
      try {
        const res = await fetch(`${API_URL}/api/storages/${box.storageId}`);
        if (!res.ok) throw new Error("Erreur lors du chargement de l’entrepôt");
        const data: Storage = await res.json();
        setStorageName(data.name);
      } catch (err) {
        console.error("❌ Erreur chargement entrepôt :", err);
        setStorageName("Inconnu");
      }
    };
    fetchStorageName();
  }, [box?.storageId, API_URL, user]);

  // 🔹 Génération de l'image de l'étiquette
  useEffect(() => {
    if (!box || !labelRef.current) return;

    const generateLabel = async () => {
      try {
        setGenerating(true);
        const dataUrl = await htmlToImage.toPng(labelRef.current, {
          quality: 1,
          backgroundColor: "#fff",
          pixelRatio: 2,
        });
        setLabelImage(dataUrl);
      } catch (err) {
        console.error("❌ Erreur génération étiquette :", err);
      } finally {
        setGenerating(false);
      }
    };

    generateLabel();
  }, [box]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-400 bg-black">
        ⏳ Chargement des détails...
      </div>
    );

  if (error || !box)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center text-gray-300 bg-black">
        <p className="mb-3 text-red-400">
          ❌ Impossible de charger les détails de la boîte.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm text-black bg-yellow-400 rounded-lg hover:bg-yellow-500"
        >
          Retour
        </button>
      </div>
    );

  return (
    <>
      <div className="flex flex-col flex-1 px-4 py-10">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-yellow-400"
          >
            <ArrowLeft size={16} />
            Retour
          </button>
          <div className="flex items-center justify-between mt-4">
            <h1 className="text-3xl font-semibold text-yellow-400">
              📦 {box.number}
            </h1>
            <button
              onClick={() => navigate(`/box/boxEdit/${box._id}`)}
              className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-yellow-400 rounded-lg"
            >
              <Edit3 size={20} />
            </button>
          </div>
        </motion.div>

        {/* Étiquette */}
        <div className="flex items-center justify-center scale-80">
          <div
            ref={labelRef}
            style={{
              width: "10cm",
              height: "4cm",
              background: "#fff",
              color: "#000",
              fontFamily: "Arial, sans-serif",
            }}
            className="flex items-center justify-center object-contain p-4 transition-transform rounded-lg cursor-pointer hover:scale-101"
            onClick={() => setShowModal(true)}
          >
            {box.qrcodeURL && (
              <img
                src={qrOptimized}
                alt="QR"
                style={{
                  width: "3cm",
                  height: "3cm",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                }}
              />
            )}
            <div className="flex-1 ml-4">
              <h2 className="text-4xl font-bold">{box.number}</h2>
              <p className="text-xl font-semibold text-gray-800">
                {box.destination}
              </p>
              <span className="flex items-center justify-end gap-1 pr-3 font-bold text-red-400">
                {box.fragile && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold text-red-700 bg-red-100 border border-red-300 rounded-full">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span>Fragile</span>
                  </div>
                )}
              </span>
            </div>
          </div>
        </div>

        <p className="flex justify-center mt-2 text-xs text-gray-500">
          Cliquez pour imprimer le QR code
        </p>

        {/* Infos boîte */}
        <div className="relative w-full p-4 mx-auto mt-4 bg-gray-900 border border-gray-800 rounded-2xl">
          <p className="mb-3 text-sm text-gray-300">
            Entrepôt :{" "}
            <span className="font-medium text-yellow-400">
              {storageName || "Inconnu"}
            </span>
          </p>
          <p className="mb-3 text-sm text-gray-300">
            Destination :{" "}
            <span className="font-medium text-yellow-400">
              {box.destination}
            </span>
          </p>
          <p className="mb-3 text-sm text-gray-300">
            Dimensions :{" "}
            <span className="font-medium text-yellow-400">
              {box.dimensions.width}×{box.dimensions.height}×
              {box.dimensions.depth} cm
            </span>
          </p>

          {/* Contenu */}
          <div className="mt-6 mb-4 font-medium text-yellow-400">
            Contenu de la boîte
          </div>
          {box.content.length > 0 ? (
            <ul className="space-y-2">
              {box.content.map((item) => (
                <BoxDetailsItem key={item._id} item={item} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">
              Aucun élément dans cette boîte.
            </p>
          )}
        </div>
      </div>

      {/* Modal impression */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="relative max-w-full max-h-[90vh] overflow-auto p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
            <div className="flex items-end justify-end w-full mb-4">
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-sm text-gray-300 transition-colors rounded-lg hover:bg-gray-800"
              >
                <X />
              </button>
            </div>
            {generating ? (
              <p className="text-gray-400">⚙️ Génération de l’étiquette...</p>
            ) : labelImage ? (
              <img
                src={labelImage}
                alt="Étiquette générée"
                className="h-auto max-w-full mx-auto border border-gray-700 rounded-md"
              />
            ) : (
              <p className="text-gray-400">❌ Échec de génération</p>
            )}

            <div className="flex justify-center gap-4 mt-6">
              <button
                className={`flex justify-center items-center gap-1 px-2 py-2 text-sm font-medium border-2 rounded-lg hover:bg-yellow-500 disabled:opacity-50 ${
                  isSelected
                    ? "bg-green-700 text-white border-green-700"
                    : "text-yellow-400 border-yellow-400"
                }`}
                onClick={() => box?._id && toggleBox(box._id)}
              >
                {isSelected ? <Minus size={15} /> : <Plus size={15} />}
                <Printer size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BoxDetails;
