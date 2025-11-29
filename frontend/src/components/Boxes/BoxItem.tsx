import { useCloudinaryImage } from "../../hooks/useCloudinaryImage";
import { Trash } from "lucide-react";

type Props = {
  box: any;
  onClick: () => void;
  onDelete: () => void;
  getStorageName: (id: string) => string;
};

export default function BoxItem({
  box,
  onClick,
  onDelete,
  getStorageName,
}: Props) {
  const { src: qrOptimized } = useCloudinaryImage(box.qrcodeURL, { w: 150 });

  return (
    <div
      className="relative flex flex-col p-4 transition-colors bg-gray-800 border border-gray-700 cursor-pointer rounded-xl hover:bg-gray-700"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-yellow-400">{box.number}</h2>

        <button
          className="p-2 transition-colors rounded hover:bg-red-700"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash size={18} />
        </button>
      </div>

      <p className="text-sm text-gray-400">
        Destination :{" "}
        <span className="font-medium text-yellow-400">{box.destination}</span>
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

      <p className="text-sm text-gray-400">
        Dimensions :{" "}
        <span className="font-medium text-yellow-400">
          {box.dimensions.width}×{box.dimensions.height}×{box.dimensions.depth}{" "}
          cm
        </span>
      </p>

      {box.qrcodeURL && (
        <img
          src={qrOptimized}
          alt="QR Code"
          loading="lazy"
          className="absolute object-contain w-16 h-16 p-1 transition-opacity border border-gray-600 rounded-md bottom-2 right-2 opacity-80 hover:opacity-100 bg-gray-900/40"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}
