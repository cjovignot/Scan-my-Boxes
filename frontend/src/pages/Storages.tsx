import { useApi } from "../hooks/useApi";
import PageWrapper from "../components/PageWrapper";

const Storages = () => {
  const { data, loading, error } = useApi<{ message: string }>("/api/example");

  return (
    <PageWrapper>
      <div className="flex flex-col items-center px-6 py-10 text-white">
        {/* Titre principal */}
        <h1 className="mb-6 text-4xl font-bold text-center text-yellow-400">
          Entrepôts
        </h1>

        {/* Note ou footer */}
        <p className="mt-10 text-sm text-center text-gray-500">
Liste de vos entrepôts.
        </p>
      </div>
    </PageWrapper>
  );
};

export default Storages;
