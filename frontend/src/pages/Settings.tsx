import { useEffect, useState } from "react";
import PageWrapper from "../components/UI/PageWrapper";
import { motion } from "framer-motion";
import { Save, ArrowLeft, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useApi } from "../hooks/useApi";
import { useApiMutation } from "../hooks/useApiMutation";
import { LABEL_PRESETS } from "../utils/labelPresets";

interface PrintSettings {
  labelPreset?: string;
  id?: string;
  name?: string;
  rows?: number;
  cols?: number;
  labelWidthCm?: number;
  labelHeightCm?: number;
  marginTopCm?: number;
  marginLeftCm?: number;
  gutterXcm?: number;
  gutterYcm?: number;
}

const Settings = () => {
  const { user } = useAuth()!;
  const navigate = useNavigate();

  const [presets, setPresets] = useState<PrintSettings[]>([...LABEL_PRESETS]);
  const [settings, setSettings] = useState<PrintSettings>({
    labelPreset: LABEL_PRESETS[0].id,
  });

  // Redirection si pas connecté
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Récupération du user pour printSettings
  const { data: fetchedUser } = useApi<{ printSettings?: PrintSettings }>(
    user?._id ? `/api/user/${user._id}` : ""
  );

  // Mettre à jour settings et ajouter preset utilisateur si nécessaire
  useEffect(() => {
    if (fetchedUser?.printSettings) {
      const userPreset = fetchedUser.printSettings;
      setSettings({ ...userPreset, labelPreset: userPreset.id });

      if (userPreset.id && !presets.find((p) => p.id === userPreset.id)) {
        setPresets((prev) => [...prev, { ...userPreset }]);
      }
    } else {
      setSettings({ ...LABEL_PRESETS[0], labelPreset: LABEL_PRESETS[0].id });
    }
  }, [fetchedUser]);

  const handleChange = (key: keyof PrintSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const { mutate: saveSettings, loading } = useApiMutation(
    user?._id ? `/api/user/${user._id}` : "",
    "PATCH",
    {
      onSuccess: () => alert("✅ Paramètres d’impression mis à jour !"),
      onError: (err) => {
        console.error("Erreur sauvegarde :", err);
        alert("❌ Erreur lors de la mise à jour des paramètres.");
      },
    }
  );

  const handleSave = () => {
    if (!user?._id) return;

    if (
      settings.labelPreset === "custom" &&
      settings.id &&
      settings.name &&
      !presets.find((p) => p.id === settings.id)
    ) {
      setPresets((prev) => [...prev, { ...settings }]);
    }

    saveSettings({ printSettings: settings });
  };

  if (!user) return null;

  const generatePresetId = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  return (
    <PageWrapper>
      <div className="flex flex-col items-center px-6 py-10 text-white">
        {/* Header */}
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
            Paramètres
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gère tes préférences d’impression.
          </p>
        </motion.div>

        {/* Formulaire */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="w-full max-w-md p-5 bg-gray-900 border border-gray-800 shadow-lg rounded-2xl"
        >
          {/* Sélecteur de preset */}
          <div className="relative flex flex-col py-3">
            <label className="mb-6 text-sm font-bold text-yellow-400">
              Format d'étiquettes
            </label>
            <div className="relative">
              <select
                value={settings.labelPreset}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "custom") {
                    setSettings({
                      labelPreset: "custom",
                      id: "",
                      name: "",
                      rows: 1,
                      cols: 1,
                      labelWidthCm: 1,
                      labelHeightCm: 1,
                      marginTopCm: 0,
                      marginLeftCm: 0,
                      gutterXcm: 0,
                      gutterYcm: 0,
                    });
                  } else {
                    const preset = presets.find((p) => p.id === value);
                    if (preset)
                      setSettings({ ...preset, labelPreset: preset.id });
                  }
                }}
                className="w-full px-3 py-2 pr-10 text-sm text-gray-300 bg-gray-900 border border-gray-700 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-yellow-400"
              >
                {presets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
                <option value="custom">Personnalisé</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute text-gray-300 -translate-y-1/2 pointer-events-none top-1/2 right-3"
              />
            </div>

            {settings.labelPreset === "custom" && (
              <div className="grid gap-4 mt-3">
                {/* Nom et ID */}
                <div className="p-3 border border-gray-700 rounded-lg">
                  <h3 className="mb-2 text-xs font-semibold text-yellow-400">
                    Informations du modèle
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="mb-1 text-xs text-gray-400">Nom*</label>
                      <input
                        type="text"
                        value={settings.name ?? ""}
                        onChange={(e) => {
                          const name = e.target.value;
                          handleChange("name", name);
                          handleChange(
                            "id",
                            name ? generatePresetId(name) : ""
                          );
                        }}
                        className="px-2 py-1 text-sm border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-yellow-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-xs text-gray-400">
                        ID (unique)
                      </label>
                      <input
                        type="text"
                        disabled
                        value={settings.id ?? ""}
                        className="px-2 py-1 text-sm text-yellow-400 border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-yellow-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Réglages feuille */}
                <div className="p-3 border border-gray-700 rounded-lg">
                  <h3 className="mb-2 text-xs font-semibold text-yellow-400">
                    Réglages feuille
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="mb-1 text-xs text-gray-400">
                        Marge haut (cm)*
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={settings.marginTopCm ?? ""}
                        onChange={(e) =>
                          handleChange(
                            "marginTopCm",
                            e.target.value === ""
                              ? undefined
                              : parseFloat(e.target.value)
                          )
                        }
                        className="px-2 py-1 text-sm border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-yellow-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-xs text-gray-400">
                        Marge gauche (cm)*
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={settings.marginLeftCm ?? ""}
                        onChange={(e) =>
                          handleChange(
                            "marginLeftCm",
                            e.target.value === ""
                              ? undefined
                              : parseFloat(e.target.value)
                          )
                        }
                        className="px-2 py-1 text-sm border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-yellow-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-xs text-gray-400">
                        Espacement X (cm)*
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={settings.gutterXcm ?? ""}
                        onChange={(e) =>
                          handleChange(
                            "gutterXcm",
                            e.target.value === ""
                              ? undefined
                              : parseFloat(e.target.value)
                          )
                        }
                        className="px-2 py-1 text-sm border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-yellow-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-xs text-gray-400">
                        Espacement Y (cm)*
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={settings.gutterYcm ?? ""}
                        onChange={(e) =>
                          handleChange(
                            "gutterYcm",
                            e.target.value === ""
                              ? undefined
                              : parseFloat(e.target.value)
                          )
                        }
                        className="px-2 py-1 text-sm border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-yellow-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Réglages étiquettes */}
                <div className="p-3 border border-gray-700 rounded-lg">
                  <h3 className="mb-2 text-xs font-semibold text-yellow-400">
                    Réglages étiquettes
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="mb-1 text-xs text-gray-400">
                        Colonnes*
                      </label>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={settings.cols ?? ""}
                        onChange={(e) =>
                          handleChange(
                            "cols",
                            e.target.value === ""
                              ? undefined
                              : parseInt(e.target.value)
                          )
                        }
                        className="px-2 py-1 text-sm border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-yellow-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-xs text-gray-400">
                        Lignes*
                      </label>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={settings.rows ?? ""}
                        onChange={(e) =>
                          handleChange(
                            "rows",
                            e.target.value === ""
                              ? undefined
                              : parseInt(e.target.value)
                          )
                        }
                        className="px-2 py-1 text-sm border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-yellow-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-xs text-gray-400">
                        Largeur (cm)*
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={settings.labelWidthCm ?? ""}
                        onChange={(e) =>
                          handleChange(
                            "labelWidthCm",
                            e.target.value === ""
                              ? undefined
                              : parseFloat(e.target.value)
                          )
                        }
                        className="px-2 py-1 text-sm border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-yellow-400"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-xs text-gray-400">
                        Hauteur (cm)*
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={settings.labelHeightCm ?? ""}
                        onChange={(e) =>
                          handleChange(
                            "labelHeightCm",
                            e.target.value === ""
                              ? undefined
                              : parseFloat(e.target.value)
                          )
                        }
                        className="px-2 py-1 text-sm border border-gray-400 rounded focus:outline-none focus:ring-1 focus:ring-yellow-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bouton Sauvegarder */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={loading}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 mt-6 font-medium text-black transition bg-yellow-400 rounded-full hover:bg-yellow-500 disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? "Enregistrement..." : "Sauvegarder"}
          </motion.button>
        </motion.div>

        <p className="mt-10 text-sm text-center text-gray-500">
          Tes préférences d’impression sont enregistrées sur ton compte.
        </p>
      </div>
    </PageWrapper>
  );
};

export default Settings;
