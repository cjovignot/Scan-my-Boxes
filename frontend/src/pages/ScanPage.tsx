import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { ArrowLeft, ChevronDown, X, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { useApiMutation } from "../hooks/useApiMutation";

interface Box {
  _id: string;
  number: string;
  ownerId: string;
  storageId?: string;
}

const ScanPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"lecture" | "stockage">("lecture");
  const [selectedStorage, setSelectedStorage] = useState("");
  const [scannedBoxesData, setScannedBoxesData] = useState<Box[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [cameraActive, setCameraActive] = useState(false); // 🔹 Nouveau state

  const {
    data: storages,
    loading: loadingStorages,
    error: storagesError,
  } = useApi<{ _id: string; name: string }[]>(
    user?._id ? `/api/storages?ownerId=${user._id}` : null
  );

  const { mutate: updateBox, loading: updating } = useApiMutation<
    Box,
    Partial<Box>
  >("/api/boxes", "PUT", {});

  // ----------------------
  // 🔹 Gestion scan QR
  // ----------------------
  const handleScan = async (res: any) => {
    if (!res || res.length === 0) return;
    const qrValue = res[0].rawValue;

    if (!user) {
      setShowModal(true);
      return;
    }

    const parts = qrValue.split("/");
    const boxId = parts[parts.length - 1];

    try {
      const box: Box = await fetch(
        `${import.meta.env.VITE_API_URL}/api/boxes/${boxId}`
      ).then((res) => res.json());

      if (mode === "lecture") {
        if (box.ownerId !== user._id) {
          alert("❌ Vous n'êtes pas le propriétaire de cette boîte.");
        } else {
          navigate(`/box/boxdetails/${boxId}`);
        }
      } else {
        setScannedBoxesData((prev) => {
          if (prev.find((b) => b._id === box._id)) return prev;
          return [...prev, box];
        });
      }
    } catch {
      alert("Erreur lors de la récupération de la boîte.");
    }
  };

  // ----------------------
  // 🔹 Sauvegarde boîtes
  // ----------------------
  const handleSave = async () => {
    if (!user?._id) {
      alert("❌ Connectez-vous pour enregistrer les boîtes.");
      return navigate("/login");
    }
    if (!selectedStorage) return alert("❌ Sélectionnez un entrepôt.");
    if (scannedBoxesData.length === 0) return alert("❌ Aucune boîte scannée.");

    try {
      await Promise.all(
        scannedBoxesData.map((box) =>
          updateBox(
            { storageId: selectedStorage },
            { url: `/api/boxes/${box._id}` }
          )
        )
      );
      alert("✅ Boîtes enregistrées avec succès !");
      setScannedBoxesData([]);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors de l’enregistrement.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col text-white bg-black">
      {/* ---------- Barre du haut ---------- */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-black/60 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-300 hover:text-yellow-400"
        >
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>
        <h1 className="text-lg font-semibold text-yellow-400">
          Scanner un code
        </h1>
        <div className="w-8" />
      </div>

      {/* ---------- Activation caméra ---------- */}
      {!cameraActive && (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 px-4 py-6">
          <p className="flex items-center justify-center w-2/3 text-center text-gray-400">
            Pour scanner un QR code, activez la caméra
          </p>
          <button
            onClick={() => setCameraActive(true)}
            className="px-6 py-3 text-black bg-yellow-400 rounded-lg hover:bg-yellow-500"
          >
            Activer la caméra
          </button>
        </div>
      )}

      {/* ---------- Scanner ---------- */}
      {cameraActive && (
        <div className="flex flex-col items-center flex-1 px-4 py-6">
          <div className="relative w-full max-w-md overflow-hidden border border-gray-700 aspect-square rounded-2xl">
            <div className="absolute z-20 flex items-center gap-2 px-2 py-1 -translate-x-1/2 border border-gray-600 rounded-full top-3 left-1/2 bg-black/60 backdrop-blur-sm w-fit">
              <span className="text-xs text-gray-300 whitespace-nowrap">
                Mode lecture
              </span>
              <label className="relative inline-flex items-center flex-shrink-0 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mode === "stockage"}
                  onChange={(e) =>
                    setMode(e.target.checked ? "stockage" : "lecture")
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-5 transition-all duration-300 bg-gray-700 rounded-full peer peer-checked:bg-yellow-400"></div>
                <div className="absolute left-[2px] top-[2px] w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
              </label>
              <span className="text-xs text-gray-300 whitespace-nowrap">
                Mode stockage
              </span>
            </div>

            <Scanner
              onScan={handleScan}
              onError={(err) => setError(err.message)}
              styles={{
                container: { width: "100%", height: "100%" },
                video: { width: "100%", height: "100%", objectFit: "cover" },
              }}
            />
          </div>

          {error && (
            <p className="mt-3 text-sm text-center text-red-400">{error}</p>
          )}

          {/* ---------- Mode stockage ---------- */}
          {mode === "stockage" && (
            <div className="w-full max-w-md mt-4 mb-4">
              {!user?._id ? (
                <div className="flex flex-col items-center gap-2 p-4 text-center border border-gray-700 rounded-xl">
                  <span className="flex items-center gap-2 text-sm text-red-700">
                    <AlertTriangle />
                    <p>Connectez-vous pour enregistrer les boîtes.</p>
                  </span>
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full px-2 py-2 text-black bg-yellow-400 rounded-lg hover:bg-yellow-500"
                  >
                    Se connecter
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <select
                      value={selectedStorage}
                      onChange={(e) => setSelectedStorage(e.target.value)}
                      className="w-full px-3 py-2 pr-10 text-sm text-white transition-colors bg-gray-900 border border-gray-700 rounded-lg appearance-none focus:ring-1 focus:ring-yellow-400"
                    >
                      <option value="">Sélectionnez un entrepôt</option>
                      {loadingStorages ? (
                        <option disabled>Chargement...</option>
                      ) : storagesError ? (
                        <option disabled>Erreur de chargement</option>
                      ) : (
                        storages?.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-1/2"
                    />
                  </div>

                  <button
                    onClick={() => setShowModal(true)}
                    disabled={scannedBoxesData.length === 0}
                    className="w-full px-4 py-2 mt-4 text-sm text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 disabled:opacity-50"
                  >
                    Voir la saisie ({scannedBoxesData.length})
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ---------- Modal boîtes scannées ---------- */}
      {showModal && user?._id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col w-full max-w-md overflow-hidden border border-gray-700 bg-gray-950 rounded-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <h3 className="text-yellow-400">
                Boîtes scannées ({scannedBoxesData.length})
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto max-h-[60vh]">
              {scannedBoxesData.length === 0 ? (
                <p className="text-sm text-gray-400">
                  Aucune boîte scannée pour l’instant.
                </p>
              ) : (
                <ul className="space-y-1">
                  {scannedBoxesData.map((box) => (
                    <li
                      key={box._id}
                      className="py-1 text-sm text-gray-300 border-b border-gray-800 last:border-none"
                    >
                      📦 {box.number}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-900/70">
              <button
                onClick={handleSave}
                disabled={updating}
                className="w-full px-4 py-2 text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 disabled:opacity-60"
              >
                {updating ? "Enregistrement..." : "✅ Fin de saisie"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanPage;
