import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { motion } from "framer-motion";
import { useApi } from "../../hooks/useApi";
import * as htmlToImage from "html-to-image";

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
  const printRef = useRef<HTMLDivElement>(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const {
    data: box,
    loading,
    error,
    refetch,
  } = useApi<Box>(id ? `/api/boxes/${id}` : undefined);

  const [storageName, setStorageName] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) refetch();
  }, [id]);

  // 🏗️ Récupère le nom de l'entrepôt correspondant
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

  // 🖼️ Génération d'une image à partir de l'étiquette
  const handleGenerateImage = async () => {
    if (!printRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(printRef.current, {
        width: 378,   // 10 cm × 37.8 px/cm
        height: 151,  // 4 cm × 37.8 px/cm
        pixelRatio: 3 // meilleure résolution
      });
      setGeneratedImage(dataUrl);
    } catch (err) {
      console.error("Erreur génération image :", err);
    }
  };

  // 🖨️ Impression directe de l’image générée
  const handlePrintImage = () => {
    if (!generatedImage) return;
    const printWindow = window.open("", "_blank", "width=600,height=400");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Étiquette</title>
          <style>
            @page { size: 10cm 4cm; margin: 0; }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              width: 10cm;
              height: 4cm;
            }
            img {
              width: 10cm;
              height: 4cm;
            }
          </style>
        </head>
        <body>
          <img src="${generatedImage}" alt="Étiquette QR" />
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400 bg-black">
        ⏳ Chargement des détails...
      </div>
    );
  }

  if (error || !box) {
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
  }

  return (
    <>
      {/* Contenu principal */}
      <div className="flex flex-col flex-1 px-4 py-10">
        {/* 🧭 En-tête */}
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
          <h1 className="mt-4 text-3xl font-semibold text-yellow-400">
            📦 {box.number}
          </h1>
        </motion.div>

        {/* 🗃️ Informations */}
        <div className="relative w-full p-4 mx-auto bg-gray-900 border border-gray-800 rounded-2xl">
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

          {/* ✅ QR Code */}
          {box.qrcodeURL && (
            <div className="flex flex-col items-center justify-center mt-6">
              <img
                src={box.qrcodeURL}
                alt="QR Code"
                className="object-contain w-48 h-48 transition-transform border border-gray-700 rounded-lg cursor-pointer bg-gray-800/60 hover:scale-105"
                onClick={() => {
                  setShowModal(true);
                  handleGenerateImage(); // 🔥 génère l’image dès ouverture du modal
                }}
              />
              <p className="mt-2 text-xs text-gray-500">
                Cliquez pour imprimer le QR code
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 🪟 Modal d’impression */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="relative max-w-full max-h-[90vh] overflow-auto p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
            {/* 🏷️ Étiquette originale invisible (pour capture) */}
            <div
              ref={printRef}
              style={{
                width: "10cm",
                height: "4cm",
                background: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #ccc",
                padding: "0.3cm",
              }}
              className="hidden"
            >
              {box.qrcodeURL && (
                <img
                  src={box.qrcodeURL}
                  alt="QR Code"
                  style={{
                    width: "3cm",
                    height: "3cm",
                    border: "1px solid #999",
                    borderRadius: "4px",
                  }}
                />
              )}
              <div style={{ marginLeft: "1cm", flex: 1 }}>
                <h2
                  style={{
                    fontSize: "26pt",
                    margin: 0,
                    fontWeight: "bold",
                    color: "#111",
                  }}
                >
                  {box.number}
                </h2>
                <p
                  style={{
                    fontSize: "16pt",
                    fontWeight: 600,
                    margin: 0,
                    color: "#333",
                  }}
                >
                  {box.destination}
                </p>
              </div>
            </div>

            {/* 🖼️ Aperçu de l’image générée */}
            {generatedImage ? (
              <img
                src={generatedImage}
                alt="Étiquette générée"
                style={{
                  width: "10cm",
                  height: "4cm",
                  border: "1px solid #666",
                  borderRadius: "6px",
                }}
              />
            ) : (
              <p className="text-gray-400 text-sm text-center">
                Génération de l’image en cours...
              </p>
            )}

            {/* 🔘 Boutons */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handlePrintImage}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black bg-yellow-400 rounded-lg hover:bg-yellow-500"
              >
                <Printer size={18} />
                Imprimer
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-300 transition-colors border border-gray-700 rounded-lg hover:bg-gray-800"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BoxDetails;