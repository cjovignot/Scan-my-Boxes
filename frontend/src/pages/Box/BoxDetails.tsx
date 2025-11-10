import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { motion } from "framer-motion";
import { useApi } from "../../hooks/useApi";

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

const BoxDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const printRef = useRef<HTMLDivElement>(null);

  const {
    data: box,
    loading,
    error,
    refetch,
  } = useApi<Box>(id ? `/api/boxes/${id}` : undefined);

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (id) refetch();
  }, [id]);

  // 🖨️ Fonction d’impression
  const handlePrint = () => {
    if (!printRef.current) return;

    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=600,height=800");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Impression QR Box</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 20px; }
            h2 { color: #444; margin-bottom: 8px; }
            p { color: #666; margin: 4px 0; }
            img { width: 200px; height: 200px; margin-top: 10px; }
          </style>
        </head>
        <body>
          ${printContents}
          <script>
            window.onload = function() {
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
            <span className="font-medium text-yellow-400">{box.storageId}</span>
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

          {/* ✅ QR Code affiché en grand */}
          {box.qrcodeURL && (
            <div className="flex flex-col items-center justify-center mt-6">
              <img
                src={box.qrcodeURL}
                alt="QR Code"
                className="w-48 h-48 object-contain border border-gray-700 rounded-lg bg-gray-800/60 cursor-pointer hover:scale-105 transition-transform"
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
                  className="flex justify-between px-3 py-2 text-sm text-gray-200 bg-gray-800 rounded-lg"
                >
                  <span>{item.name}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl">
            <div ref={printRef} className="text-center text-white">
              <h2 className="text-2xl font-semibold text-yellow-400">
                Boîte {box.number}
              </h2>
              <p className="mt-1 text-gray-300">{box.destination}</p>
              {box.qrcodeURL && (
                <img
                  src={box.qrcodeURL}
                  alt="QR Code"
                  className="w-52 h-52 mx-auto mt-4 border border-gray-700 rounded-lg bg-gray-800/50 p-2"
                />
              )}
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handlePrint}
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