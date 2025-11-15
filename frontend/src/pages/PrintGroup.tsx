import { useEffect, useState, useRef } from "react";
import { usePrint } from "../hooks/usePrint";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../contexts/useAuth";
import {
  X,
  AlertTriangle,
  ChevronDown,
  RotateCcw,
  PrinterCheck,
} from "lucide-react";
import * as htmlToImage from "html-to-image";
import { LABEL_PRESETS } from "../utils/labelPresets";

interface Box {
  _id: string;
  number: string;
  content: { name: string; quantity: number }[];
  qrcodeURL: string;
  dimensions: { width: number; height: number; depth: number };
  destination: string;
  fragile?: boolean;
}

const PrintGroup = () => {
  const { selectedBoxes, toggleBox, clearSelection } = usePrint();
  const [boxesToPrint, setBoxesToPrint] = useState<Box[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [presetId, setPresetId] = useState("microapp‑5057");
  const [presets, setPresets] = useState([...LABEL_PRESETS]);

  const previewRef = useRef<HTMLDivElement>(null);
  const printContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidthPx, setContainerWidthPx] = useState(window.innerWidth);

  const { user } = useAuth()!;
  const { data: userData } = useApi<{ printSettings?: any }>(
    user?._id ? `/api/user/${user._id}` : null,
    { skip: !user?._id }
  );

  const { data, loading, error } = useApi<Box[]>(
    selectedBoxes.length > 0
      ? `/api/boxes?ids=${selectedBoxes.join(",")}`
      : null
  );

  // 🔹 Ajouter le preset custom du user si existant
  useEffect(() => {
    if (userData?.printSettings) {
      const ps = userData.printSettings;

      // Créer un preset complet à partir des valeurs user ou fallback
      const fullPreset = {
        id: ps.id || "custom",
        name: ps.name || "Personnalisé",
        rows: ps.rows || 1,
        cols: ps.cols || 1,
        labelWidthCm: ps.labelWidthCm || 1,
        labelHeightCm: ps.labelHeightCm || 1,
        marginTopCm: ps.marginTopCm || 0,
        marginLeftCm: ps.marginLeftCm || 0,
        gutterXcm: ps.gutterXcm || 0,
        gutterYcm: ps.gutterYcm || 0,
      };

      // Ajouter si non présent
      if (!presets.find((p) => p.id === fullPreset.id)) {
        setPresets((prev) => [...prev, fullPreset]);
      }

      // Sélectionner ce preset
      setPresetId(fullPreset.id);
    }
  }, [userData]);

  useEffect(() => {
    if (data) {
      const sortedBoxes = [...data].sort((a, b) =>
        a.number.localeCompare(b.number)
      );
      setBoxesToPrint(sortedBoxes);
    }
  }, [data]);

  useEffect(() => {
    const updateWidth = () => {
      const width = previewRef.current?.clientWidth || window.innerWidth;
      setContainerWidthPx(width * 0.9);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  if (selectedBoxes.length === 0)
    return (
      <div className="flex items-center justify-center h-screen p-6 text-yellow-400">
        Aucune boîte sélectionnée pour l'impression
      </div>
    );

  if (loading)
    return (
      <div className="p-6 text-center text-yellow-400">
        Chargement des boîtes...
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-center text-red-400">
        Erreur lors de la récupération des boîtes : {error}
      </div>
    );

  const preset = presets.find((p) => p.id === presetId) || LABEL_PRESETS[0];
  const rowsPerPage = (preset as any).rows || 1;
  const colsPerPage = (preset as any).cols || 1;
  const totalSlots = rowsPerPage * colsPerPage;
  const gapPx = 4;

  const labelsWithOffset = Array(totalSlots).fill(null);
  boxesToPrint.forEach((box, idx) => {
    const position = startIndex + idx;
    if (position < totalSlots) labelsWithOffset[position] = box;
  });

  const labelRatio =
    (preset as any).labelWidthCm / (preset as any).labelHeightCm;
  const labelWidthPx =
    (containerWidthPx - gapPx * (colsPerPage - 1)) / colsPerPage;
  const labelHeightPx = labelWidthPx / labelRatio;

  const handlePrint = async () => {
    if (!printContainerRef.current) return;

    // ouvrir la nouvelle page (AVANT async)
    const printWindow = window.open("/print.html", "_blank");
    if (!printWindow) return;

    // attendre que la fenêtre charge son script
    const waitLoaded = () =>
      new Promise<void>((resolve) => {
        const timer = setInterval(() => {
          try {
            if (printWindow.document.readyState === "complete") {
              clearInterval(timer);
              resolve();
            }
          } catch {}
        }, 50);
      });

    await waitLoaded();

    // générer les images
    const images: string[] = [];
    const labels = [...printContainerRef.current.children] as HTMLDivElement[];

    for (const label of labels) {
      const dataUrl = await htmlToImage.toPng(label, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      images.push(dataUrl);
    }

    printWindow.postMessage(images, "*");
  };

  return (
    <>
      <div className="p-6">
        <h1 className="mb-4 text-xl font-bold text-yellow-400">
          Aperçu impression
        </h1>

        {/* Sélection du preset */}
        <label className="block mb-1 text-sm font-medium">
          Format d'étiquettes :
        </label>
        <div className="relative flex items-center mb-4">
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value)}
            className="w-full px-3 py-2 pr-10 text-sm text-white border border-gray-700 rounded-lg appearance-none bg-gray-950 focus:outline-none focus:ring-1 focus:ring-yellow-400 hover:bg-gray-700"
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-3 top-[52%]"
          />
        </div>
      </div>

      {/* Aperçu adaptatif */}
      <div
        ref={previewRef}
        style={{
          width: "90%",
          // display: "grid",
          gridTemplateColumns: `repeat(${colsPerPage}, 1fr)`,
          gap: `${gapPx}px`,
        }}
        className="grid m-auto"
      >
        {labelsWithOffset.map((box, idx) => {
          const qrSize = labelHeightPx * 0.9;
          const padding = 6;
          const contentWidth = labelWidthPx - qrSize - padding * 2;
          const contentHeight = labelHeightPx - padding * 2;
          const baseFontSize = 16;
          const scale = Math.min(contentWidth / 80, contentHeight / 50);

          return (
            <div
              key={idx}
              onClick={() => setStartIndex(idx)}
              style={{
                width: labelWidthPx,
                height: labelHeightPx,
                backgroundColor: "#fff",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: `${padding}px 2px`,
                boxSizing: "border-box",
                position: "relative",
                borderRadius: "8px",
                cursor: "pointer",
                border:
                  startIndex === idx ? "2px dashed #facc15" : "1px solid #ddd",
              }}
            >
              {box ? (
                <>
                  {box.qrcodeURL && (
                    <img
                      src={box.qrcodeURL}
                      alt={`QR ${box.number}`}
                      style={{
                        width: qrSize,
                        height: qrSize,
                        marginRight: padding,
                        objectFit: "contain",
                        borderRadius: "10px",
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: contentWidth,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      color: "black",
                    }}
                  >
                    <div className="flex flex-col items-start">
                      <span
                        style={{
                          fontWeight: "bold",
                          fontSize: `${baseFontSize * scale}px`,
                          lineHeight: 1.1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {box.number}
                      </span>
                      <span
                        style={{
                          fontSize: `${baseFontSize * 0.8 * scale}px`,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: "#555",
                        }}
                      >
                        {box.destination}
                      </span>
                    </div>
                    {box.fragile && (
                      <div
                        style={{
                          fontSize: `${baseFontSize * 0.7 * scale}px`,
                          gap: 2,
                        }}
                        className="flex items-center self-end justify-center px-1 mr-1 font-bold text-red-900 border border-red-900 rounded-full w-fit bg-red-700/10"
                      >
                        <AlertTriangle
                          size={`${baseFontSize * 0.7 * scale}px`}
                        />
                        Fragile
                      </div>
                    )}
                  </div>
                  <button
                    className="text-white bg-red-800 rounded-full"
                    onClick={() => toggleBox(box._id)}
                    style={{
                      position: "absolute",
                      padding: "2px",
                      top: -5,
                      right: -5,
                    }}
                  >
                    <X size={`${baseFontSize * 0.7 * scale}px`} />
                  </button>
                </>
              ) : (
                <span
                  style={{
                    width: "100%",
                    textAlign: "center",
                    color: "#aaa",
                    fontSize: `${baseFontSize * 0.7 * scale}px`,
                  }}
                >
                  Vide
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end w-full gap-2 px-6 mt-4">
        <button
          onClick={clearSelection}
          className="px-4 py-2 text-black bg-yellow-400 rounded-lg hover:bg-yellow-500"
        >
          <RotateCcw />
        </button>
        <button
          onClick={handlePrint}
          className="flex gap-2 px-4 py-2 text-black bg-green-400 rounded-lg hover:bg-green-500"
        >
          <PrinterCheck /> Imprimer
        </button>
      </div>

      {/* Rendu invisible pour html-to-image */}
      <div
        ref={printContainerRef}
        style={{
          position: "fixed",
          inset: "0",
          width: 0,
          height: 0,
          overflow: "hidden",
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        {labelsWithOffset.map((box, idx) => {
          const qrSize = labelHeightPx * 0.9;
          const padding = 6;
          const contentWidth = labelWidthPx - qrSize - padding * 2;
          const contentHeight = labelHeightPx - padding * 2;
          const baseFontSize = 16;
          const scale = Math.min(contentWidth / 80, contentHeight / 50);

          return (
            <div
              key={idx}
              style={{
                width: labelWidthPx,
                height: labelHeightPx,
                backgroundColor: "#fff",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: `${padding}px 2px`,
                boxSizing: "border-box",
                position: "relative",
                borderRadius: "8px",
              }}
            >
              {box ? (
                <>
                  {box.qrcodeURL && (
                    <img
                      src={box.qrcodeURL}
                      alt={`QR ${box.number}`}
                      style={{
                        width: qrSize,
                        height: qrSize,
                        marginRight: padding,
                        objectFit: "contain",
                        borderRadius: "10px",
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: contentWidth,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      color: "black",
                    }}
                  >
                    <div className="flex flex-col items-start">
                      <span
                        style={{
                          fontWeight: "bold",
                          fontSize: `${baseFontSize * scale}px`,
                          lineHeight: 1.1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {box.number}
                      </span>
                      <span
                        style={{
                          fontSize: `${baseFontSize * 0.8 * scale}px`,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: "#555",
                        }}
                      >
                        {box.destination}
                      </span>
                    </div>
                    {box.fragile && (
                      <div
                        style={{
                          fontSize: `${baseFontSize * 0.7 * scale}px`,
                          gap: 2,
                        }}
                        className="flex items-center self-end justify-center px-1 mr-1 font-bold text-red-900 border border-red-900 rounded-full w-fit bg-red-700/10"
                      >
                        <AlertTriangle
                          size={`${baseFontSize * 0.7 * scale}px`}
                        />
                        Fragile
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default PrintGroup;
