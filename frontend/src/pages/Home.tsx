import { useApi } from "../hooks/useApi";
import PageWrapper from "../components/PageWrapper";

const Home = () => {
  const { data, loading, error } = useApi<{ message: string }>("/api/example");

  return (
    <PageWrapper>
      <div className="flex flex-col items-center px-6 py-10 text-white">
        {/* Titre principal */}
        <h1 className="mb-6 text-4xl font-bold text-center text-yellow-400">
          🚀 Scan My Boxes
        </h1>

        {/* Carte de contenu */}
        <div className="w-full max-w-md p-6 bg-gray-900 border border-gray-800 shadow-lg rounded-2xl">
          {loading && (
            <p className="text-center text-gray-400">
              ⏳ Chargement des données...
            </p>
          )}
          {error && <p className="text-center text-red-400">❌ {error}</p>}
          {data && (
            <div className="text-center">
              <p className="mb-2 text-gray-300">🛰️ Réponse de l’API :</p>
              <code className="px-3 py-1 text-yellow-400 bg-gray-800 rounded-md">
                {data.message}
              </code>
            </div>
          )}
        </div>

        {/* Note ou footer */}
        <p className="mt-10 text-sm text-center text-gray-500">
          Cliquez sur les icônes pour en savoir plus.
        </p>
      </div>
    </PageWrapper>
  );
};

export default Home;
