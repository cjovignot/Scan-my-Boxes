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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
    <div className="relative max-w-full max-h-[90vh] overflow-auto p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
      
      {/* 🏷️ Wrapper de mise à l’échelle */}
      <div
        className="flex justify-center items-center"
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <div
          className="origin-top scale-[var(--scale)]"
          style={{
            "--scale": 1,
            transformOrigin: "top center",
          }}
          ref={(el) => {
            if (el) {
              // 🧠 Ajuste dynamiquement le zoom selon la taille de la fenêtre
              const parent = el.parentElement;
              const maxWidth = parent.offsetWidth;
              const maxHeight = parent.offsetHeight;
              const labelWidth = 12 * 37.8; // 1 cm ≈ 37.8 px
              const labelHeight = 6 * 37.8;
              const scale = Math.min(
                maxWidth / labelWidth,
                maxHeight / labelHeight,
                1
              );
              el.style.setProperty("--scale", scale);
            }
          }}
        >
          {/* 🏷️ Étiquette à imprimer */}
          <div
            ref={printRef}
            className="flex items-center justify-between bg-white text-black p-3 rounded-md border border-gray-300 mx-auto"
            style={{
              width: "12cm",
              height: "6cm",
              fontFamily: "Arial, sans-serif",
            }}
          >
            {/* 🧩 QR Code */}
            {box.qrcodeURL && (
              <img
                src={box.qrcodeURL}
                alt="QR Code"
                className="object-contain w-[5cm] h-[5cm] border border-gray-400 rounded-md"
              />
            )}

            {/* 📝 Infos */}
            <div className="flex flex-col justify-center flex-1 ml-4">
              <h2
                className="font-bold text-gray-900"
                style={{ fontSize: "26pt", lineHeight: "1.2" }}
              >
                {box.number}
              </h2>
              <p
                className="mt-3 text-gray-700"
                style={{ fontSize: "14pt", fontWeight: 500 }}
              >
                Destination :
              </p>
              <p
                className="text-gray-800"
                style={{ fontSize: "16pt", fontWeight: 600 }}
              >
                {box.destination}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🖨️ Boutons */}
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