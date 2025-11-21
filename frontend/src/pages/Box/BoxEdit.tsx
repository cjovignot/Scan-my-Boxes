import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import { ArrowLeft, Save, Plus, Camera, ChevronDown } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useAuth } from "../../contexts/useAuth";

type Storage = {
  _id: string;
  name: string;
};

type BoxItem = {
  _id?: string;
  name: string;
  quantity: number;
  picture: string;
  uploading?: boolean;
};

type Box = {
  _id: string;
  number: string;
  destination: string;
  storageId: string;
  fragile: boolean;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  content: BoxItem[];
};

const BoxEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth(); // 🔹 Utilisation du contexte Auth

  // Charger la boîte
  const {
    data: box,
    loading: loadingBox,
    error: errorBox,
  } = useApi<Box>(id ? `/api/boxes/${id}` : null);

  // Charger la liste des entrepôts
  const {
    data: storages,
    loading: loadingStorages,
    error: errorStorages,
  } = useApi<Storage[]>(user?._id ? `/api/storages?ownerId=${user._id}` : null);

  // Mutation pour mettre à jour la boîte
  const { mutate: updateBox, loading: updating } = useApiMutation(
    id ? `/api/boxes/${id}` : "",
    "PUT",
    {
      onSuccess: () => {
        alert("✅ Boîte mise à jour avec succès !");
        navigate(`/box/boxDetails/${id}`);
      },
      onError: (err) => {
        console.error("Erreur mise à jour boîte :", err);
        alert("❌ Impossible de mettre à jour la boîte.");
      },
    }
  );

  // États du formulaire
  const [form, setForm] = useState({
    destination: "",
    storageId: "",
    width: "",
    height: "",
    depth: "",
    fragile: false,
  });
  const [contentItems, setContentItems] = useState<BoxItem[]>([]);

  // Remplir le formulaire quand la boîte est chargée
  useEffect(() => {
    if (box) {
      setForm({
        destination: box.destination || "",
        storageId: box.storageId || "",
        width: box.dimensions?.width?.toString() || "",
        height: box.dimensions?.height?.toString() || "",
        depth: box.dimensions?.depth?.toString() || "",
        fragile: box.fragile || false,
      });
      setContentItems(box.content || []);
    }
  }, [box]);

  // Gestion des champs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Gestion des objets
  const handleAddItem = () => {
    setContentItems((prev) => [
      ...prev,
      { name: "", quantity: 1, picture: "" },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setContentItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof BoxItem,
    value: string | number
  ) => {
    setContentItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Upload d'image (Cloudinary)
  const handleImageUpload = async (index: number, file: File) => {
    const updated = [...contentItems];
    updated[index].uploading = true;
    setContentItems(updated);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      );

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await res.json();

      if (data.secure_url) {
        updated[index].picture = data.secure_url;
      } else {
        throw new Error("Upload Cloudinary invalide");
      }
    } catch (err) {
      console.error("Erreur upload :", err);
      alert("❌ Erreur pendant l’envoi de l’image.");
    } finally {
      updated[index].uploading = false;
      setContentItems([...updated]);
    }
  };

  // Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return alert("Utilisateur non connecté.");

    const payload = {
      ...form,
      ownerId: user._id,
      content: contentItems,
      dimensions: {
        width: Number(form.width),
        height: Number(form.height),
        depth: Number(form.depth),
      },
    };

    updateBox(payload);
  };

  // Rendu
  if (loadingBox)
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-screen text-gray-400 bg-black">
          Chargement de la boîte...
        </div>
      </PageWrapper>
    );

  if (errorBox || !box)
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-screen text-center text-gray-300 bg-black">
          <p className="mb-3 text-red-400">
            ❌ Impossible de charger la boîte à éditer.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm text-black bg-yellow-400 rounded-lg hover:bg-yellow-500"
          >
            Retour
          </button>
        </div>
      </PageWrapper>
    );

  return (
    <PageWrapper>
      <div className="px-6 py-10 text-white">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-yellow-400"
          >
            <ArrowLeft size={20} /> Retour
          </button>
          <h1 className="flex items-center text-xl font-bold text-yellow-400">
            Édition : <span className="ml-1">{box.number}</span>
          </h1>
        </div>

        {/* FORMULAIRE */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col max-w-2xl gap-2 p-4 mx-auto bg-gray-800 border border-gray-700 rounded-xl"
        >
          {/* Champs de base */}
          <input
            type="text"
            name="destination"
            placeholder="Destination"
            value={form.destination}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm text-white transition-colors border border-gray-700 rounded-lg bg-gray-950 focus:ring-1 focus:ring-yellow-400 hover:bg-gray-700"
            required
          />

          <div className="relative">
            <select
              name="storageId"
              value={form.storageId}
              onChange={handleChange}
              className="w-full px-3 py-2 pr-10 text-sm text-white transition-colors border border-gray-700 rounded-lg appearance-none bg-gray-950 focus:ring-1 focus:ring-yellow-400 hover:bg-gray-700"
              required
            >
              <option value="">Sélectionnez un entrepôt</option>
              {loadingStorages ? (
                <option disabled>Chargement...</option>
              ) : errorStorages ? (
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

          {/* Contenu dynamique */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-yellow-400 text-md">Contenu</h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 px-3 py-1 text-sm text-black bg-yellow-400 rounded-md hover:bg-yellow-500"
              >
                <Plus size={16} /> Ajouter un objet
              </button>
            </div>

            {contentItems.length === 0 && (
              <p className="text-sm text-gray-400">
                Aucun objet ajouté pour l’instant.
              </p>
            )}

            {contentItems.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 p-3 mt-2 border border-gray-700 rounded-lg bg-gray-950"
              >
                {/* Nom et quantité */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nom de l’objet"
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(index, "name", e.target.value)
                    }
                    className="flex-1 w-3/4 px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-yellow-400"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Quantité"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        Number(e.target.value)
                      )
                    }
                    className="w-1/4 px-3 py-1 text-center bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-yellow-400"
                    required
                  />
                </div>

                {/* Image */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center overflow-hidden bg-gray-900 border border-gray-700 rounded-lg w-30 h-30">
                    {item.uploading ? (
                      <span className="text-xs text-yellow-400 animate-pulse">
                        Envoi...
                      </span>
                    ) : item.picture ? (
                      <img
                        src={item.picture}
                        alt="Aperçu"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-xs text-center text-gray-500">
                        Aperçu
                      </span>
                    )}
                  </div>

                  <label className="flex flex-col items-center justify-center flex-1 gap-2 p-2 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700">
                    <Camera size={16} />
                    <span className="text-sm">
                      {item.picture ? "Changer la photo" : "Ajouter une photo"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(index, file);
                      }}
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="flex-shrink-0 p-2 text-sm text-white bg-red-900 rounded-lg hover:text-red-400"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>

          {/* Dimensions */}
          <div className="flex gap-2 mt-4">
            {["width", "height", "depth"].map((dim) => (
              <input
                key={dim}
                type="number"
                name={dim}
                placeholder={`${dim} (cm)`}
                value={(form as any)[dim]}
                onChange={handleChange}
                className="w-1/3 px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:ring-1 focus:ring-yellow-400"
              />
            ))}
          </div>

          {/* Fragile */}
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="fragile"
              name="fragile"
              checked={form.fragile}
              onChange={(e) => setForm({ ...form, fragile: e.target.checked })}
              className="w-5 h-5 accent-yellow-400"
            />
            <label htmlFor="fragile" className="text-sm text-gray-300">
              Boîte fragile
            </label>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="flex items-center justify-center gap-2 px-4 py-2 mt-6 text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 disabled:opacity-60"
          >
            {updating ? (
              "Mise à jour..."
            ) : (
              <>
                <Save size={18} /> Enregistrer
              </>
            )}
          </button>
        </form>
      </div>
    </PageWrapper>
  );
};

export default BoxEdit;
