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
  const labelRef = useRef<HTMLDivElement>(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const { data: box, loading, error, refetch } = useApi<Box>(
    id ? `/api/boxes/${id}` : undefined
  );

  const [storageName, setStorageName] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [labelImage, setLabelImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (id) refetch();
  }, [id]);

  // 🏗️ Récupère le nom de l'entrepôt
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

  // 🧩 Génération automatique de l’image de l’étiquette
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

  // 🖨️ Impression
  const handlePrint = () => {
  if (!labelImage) return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Étiquette ${box?.number}</title>
        <style>
          @page {
            size: 10cm 4cm;
            margin: 0;
          }
          html, body {
            margin: 0;
            padding: 0;
          }
          img {
            width: 10cm;
            height: 4cm;
            object-fit: contain;
            display: block;
          }
        </style>
      </head>
      <body>
        <img src="${labelImage}" alt="Étiquette" />
        <script>
          window.onload = () => { window.print(); window.onafterprint = () => window.close(); };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};

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
                onClick={() => setShowModal(true)}
              />
              <p className="mt-2 text-xs text-gray-500">
                Cliquez pour imprimer le QR code
              </p>
            </div>
          )}

          {/* 📦 Contenu */}
          <div className="mt-6 mb-4 font-medium text-yellow-400">
            Contenu de la boîte
          </div>
          {box.content.length > 0 ? (
            <ul className="space-y-2">
              {box.content.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start justify-start gap-3 px-3 py-2 text-sm text-gray-200 bg-gray-800 rounded-lg"
                >
                  {item.picture && (
                    <img
                      src={item.picture}
                      alt={item.name}
                      className="object-cover w-20 h-20 border border-gray-700 rounded-lg"
                    />
                  )}
                  <span className="font-medium">{item.name}</span>
                  {item.quantity && (
                    <span className="text-gray-400">x{item.quantity}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">
              Aucun élément dans cette boîte.
            </p>
          )}
        </div>
      </div>

      {/* 🪟 Modal d’impression */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="relative max-w-full max-h-[90vh] overflow-auto p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
            {generating ? (
              <p className="text-gray-400">⚙️ Génération de l’étiquette...</p>
            ) : labelImage ? (
              <img
                src={labelImage}
                alt="Étiquette générée"
                className="max-w-full h-auto mx-auto border border-gray-700 rounded-md"
              />
            ) : (
              <p className="text-gray-400">❌ Échec de génération</p>
            )}

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handlePrint}
                disabled={!labelImage}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 disabled:opacity-50"
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

      {/* 🏷️ Étiquette invisible pour génération */}
      <div
        ref={labelRef}
        style={{
          width: "10cm",
          height: "4cm",
          padding: "0.5cm",
          background: "#fff",
          color: "#000",
          fontFamily: "Arial, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        className="hidden"
      >
        {box.qrcodeURL && (
          <img
            src={box.qrcodeURL}
            alt="QR"
            style={{
              width: "3cm",
              height: "3cm",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          />
        )}
        <div style={{ flex: 1, marginLeft: "1cm" }}>
          <h2 style={{ fontSize: "26pt", fontWeight: "bold" }}>
            {box.number}
          </h2>
          <p style={{ fontSize: "16pt", fontWeight: 600 }}>
            {box.destination}
          </p>
        </div>
      </div>
    </>
  );
};

export default BoxDetails;