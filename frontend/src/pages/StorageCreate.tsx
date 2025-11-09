import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { ArrowLeft, Save } from "lucide-react";
import { useApiMutation } from "../hooks/useApiMutation";

const StorageCreate = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    name: "",
    location: "",
  });

  // 🧠 Hook pour créer un entrepôt
  const { mutate, loading, error } = useApiMutation<
    any,
    { name: string; address: string; ownerId: string }
  >("/api/storages", "POST", {
    onSuccess: () => {
      alert("✅ Entrepôt créé avec succès !");
      navigate("/storages");
    },
    onError: () => {
      alert("❌ Erreur lors de la création de l'entrepôt");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await mutate({
      ownerId: user._id,
      name: form.name,
      address: form.location,
    });
  };

  return (
    <PageWrapper>
      <div className="px-6 py-10 text-white">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-yellow-400"
          >
            <ArrowLeft size={20} /> Retour
          </button>
          <h1 className="text-3xl font-bold text-yellow-400">
            Créer un entrepôt
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col max-w-lg gap-4 p-6 mx-auto bg-gray-800 border border-gray-700 rounded-xl"
        >
          <input
            type="text"
            name="name"
            placeholder="Nom de l'entrepôt"
            value={form.name}
            onChange={handleChange}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:ring-1 focus:ring-yellow-400"
            required
          />

          <input
            type="text"
            name="location"
            placeholder="Adresse"
            value={form.location}
            onChange={handleChange}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:ring-1 focus:ring-yellow-400"
          />

          {error && (
            <p className="mt-2 text-sm text-center text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 mt-6 text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 disabled:opacity-50"
          >
            {loading ? (
              <span>Création...</span>
            ) : (
              <>
                <Save size={18} /> Créer l’entrepôt
              </>
            )}
          </button>
        </form>
      </div>
    </PageWrapper>
  );
};

export default StorageCreate;
