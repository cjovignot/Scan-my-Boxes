import PageWrapper from "../components/PageWrapper";

type Box = {
  _id: string;
  ownerId: string;
  storageId: string;
  content: string[];
  destination: string;
  qrcodeURL: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
};

const mockBoxes: Box[] = [
  {
    _id: "box1",
    ownerId: "user123",
    storageId: "storageA",
    content: ["T-shirt", "Chaussures", "Livre"],
    destination: "Paris",
    qrcodeURL: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=box1",
    dimensions: { width: 40, height: 30, depth: 20 },
  },
  {
    _id: "box2",
    ownerId: "user123",
    storageId: "storageB",
    content: ["Vase", "Couverture"],
    destination: "Lyon",
    qrcodeURL: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=box2",
    dimensions: { width: 50, height: 25, depth: 25 },
  },
  {
    _id: "box3",
    ownerId: "user123",
    storageId: "storageC",
    content: ["Chaise", "Tablette", "Lampe"],
    destination: "Bordeaux",
    qrcodeURL: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=box3",
    dimensions: { width: 60, height: 40, depth: 30 },
  },
];

const Home = () => {
  const boxes = mockBoxes; // simulation de l'API
  const loading = false;
  const error = null;

  return (
    <PageWrapper>
      <div className="flex flex-col items-center px-6 py-10 text-white">
        <h1 className="mb-6 text-4xl font-bold text-center text-yellow-400">
          📦 Mes boîtes
        </h1>

        {loading && (
          <p className="text-center text-gray-400">⏳ Chargement des boîtes...</p>
        )}
        {error && <p className="text-center text-red-400">❌ {error}</p>}

        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {boxes.map((box) => (
            <div
              key={box._id}
              className="p-6 bg-gray-900 border border-gray-800 shadow-lg rounded-2xl flex flex-col items-center"
            >
              <img
                src={box.qrcodeURL}
                alt={`QR Code for box ${box._id}`}
                className="w-32 h-32 mb-4"
              />
              <h2 className="mb-2 text-lg font-semibold text-yellow-400">
                📍 Destination : {box.destination}
              </h2>
              <p className="mb-2 text-gray-300">
                Dimensions : {box.dimensions.width} x {box.dimensions.height} x{" "}
                {box.dimensions.depth} cm
              </p>
              <p className="mb-2 text-gray-400">
                Contenu : {box.content.length} objets
              </p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-center text-gray-500">
          Cliquez sur une boîte pour plus de détails.
        </p>
      </div>
    </PageWrapper>
  );
};

export default Home;