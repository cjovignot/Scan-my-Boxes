import { useEffect, useState, useRef } from "react";
import { usePrint } from "../hooks/usePrint";
import { useApi } from "../hooks/useApi";
import { X, AlertTriangle } from "lucide-react";
import * as htmlToImage from "html-to-image";

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
  const printContainerRef = useRef<HTMLDivElement>(null);

  const { data, loading, error } = useApi<Box[]>(
    selectedBoxes.length > 0
      ? `/api/boxes?ids=${selectedBoxes.join(",")}`
      : null
  );

  useEffect(() => {
    if (data) {
      const sortedBoxes = [...data].sort((a, b) =>
        a.number.localeCompare(b.number)
      );
      setBoxesToPrint(sortedBoxes);
    }
  }, [data]);

  if (selectedBoxes.length === 0)
    return (
      <div className="p-6 text-center text-gray-400">
        Aucune boîte sélectionnée pour l'impression.
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

  const rowsPerPage = 6;
  const colsPerPage = 2;
  const totalSlots = rowsPerPage * colsPerPage;

  const labelsWithOffset = Array(totalSlots).fill(null);
  boxesToPrint.forEach((box, idx) => {
    const position = startIndex + idx;
    if (position < totalSlots) {
      labelsWithOffset[position] = box;
    }
  });

  const handlePrint = async () => {
    if (!printContainerRef.current) return;

    const images: string[] = [];

    const labelElements = Array.from(
      printContainerRef.current.children
    ) as HTMLDivElement[];
    for (const el of labelElements) {
      try {
        const dataUrl = await htmlToImage.toPng(el, {
          quality: 1,
          backgroundColor: "#fff",
          pixelRatio: 2,
        });
        images.push(dataUrl);
      } catch (err) {
        console.error("Erreur génération étiquette :", err);
      }
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Étiquettes</title>
          <style>
            @page { margin:0; }
            body { margin:0; padding:0; display:flex; flex-wrap:wrap; gap:0.5cm; }
            img { width:10cm; height:4cm; object-fit:contain; }
          </style>
        </head>
        <body>
          ${images.map((src) => `<img src="${src}" />`).join("")}
          <script>
            window.onload = () => { window.print(); window.onafterprint = () => window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold text-yellow-400">
        Aperçu impression
      </h1>

      {/* Décalage */}
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm font-medium" htmlFor="startIndex">
          Commencer à la case :
        </label>
        <input
          type="number"
          id="startIndex"
          min={0}
          max={totalSlots - 1}
          value={startIndex}
          onChange={(e) => setStartIndex(Number(e.target.value))}
          className="w-16 p-1 border rounded"
        />
        <span className="text-xs text-gray-500">
          (0 = première case en haut à gauche)
        </span>
      </div>

      {/* Grille d'aperçu */}
      <div className="grid grid-cols-2 gap-2">
        {labelsWithOffset.map((box, idx) => (
          <div
            key={idx}
            className="relative flex flex-col justify-center p-2 text-black bg-white border border-gray-700 rounded min-h-18"
          >
            {box ? (
              <>
                <div className="flex w-full h-full">
                  {box.qrcodeURL && (
                    <img
                      src={box.qrcodeURL}
                      alt={`QR ${box.number}`}
                      className="border border-gray-300 rounded-md w-14 h-14"
                    />
                  )}
                  <div className="flex flex-col ml-2">
                    <span className="text-sm font-bold">{box.number}</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {box.destination}
                    </span>
                    {box.fragile && (
                      <div className="inline-flex items-center gap-1 px-2 mt-1 text-xs font-semibold text-red-700 bg-red-100 border border-red-300 rounded-full">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        Fragile
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleBox(box._id)}
                  className="absolute p-1 text-xs text-white bg-red-400 rounded top-1 right-1 hover:bg-red-500"
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <span className="w-full text-xs text-center text-gray-400">
                Vide
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Container invisible pour html-to-image */}
      <div
        ref={printContainerRef}
        style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
      >
        {labelsWithOffset.map((box, idx) => {
          if (!box)
            return <div key={idx} style={{ width: "10cm", height: "4cm" }} />;
          return (
            <div
              key={idx}
              style={{
                width: "10cm",
                height: "4cm",
                display: "flex",
                padding: "0.3cm",
                fontFamily: "Arial, sans-serif",
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                boxSizing: "border-box",
              }}
            >
              {box.qrcodeURL && (
                <img
                  src={box.qrcodeURL}
                  alt="QR"
                  style={{ width: "3cm", height: "3cm", marginRight: "0.3cm" }}
                />
              )}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                  {box.number}
                </span>
                <span style={{ fontSize: "0.9em", color: "#555" }}>
                  {box.destination}
                </span>
                {box.fragile && (
                  <div
                    style={{
                      color: "red",
                      fontSize: "0.7em",
                      marginTop: "0.2em",
                    }}
                  >
                    ⚠ Fragile
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={clearSelection}
          className="px-4 py-2 text-black bg-yellow-400 rounded hover:bg-yellow-500"
        >
          Vider la sélection
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 text-black bg-green-400 rounded hover:bg-green-500"
        >
          Imprimer les étiquettes
        </button>
      </div>
    </div>
  );
};

export default PrintGroup;
