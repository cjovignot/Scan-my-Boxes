// src/config/labelPresets.ts

export interface LabelPreset {
  id: string; // identifiant unique du preset
  name: string; // nom lisible du preset
  rows: number; // nombre de lignes d'étiquettes par page
  cols: number; // nombre de colonnes d'étiquettes par page
  labelWidthCm: number; // largeur d'une étiquette (cm)
  labelHeightCm: number; // hauteur d'une étiquette (cm)
  marginTopCm: number; // marge entre le haut de la feuille et la première ligne (cm)
  marginLeftCm: number; // marge entre le bord gauche de la feuille et la première colonne (cm)
  gutterXcm: number; // espace horizontal entre deux colonnes (cm)
  gutterYcm: number; // espace vertical entre deux lignes (cm)
}

export const LABEL_PRESETS: LabelPreset[] = [
  // ——————————————————————————————————————————
  // MICRO APPLICATION PRESSETS
  // ——————————————————————————————————————————
  {
    id: "microapp‑5057",
    name: "Micro Application 5057 (6,05 × 2,96 cm)",
    rows: 8,
    cols: 3,
    labelWidthCm: 6.05,
    labelHeightCm: 2.96,
    marginTopCm: 2.35, // est. à ajuster
    marginLeftCm: 1.2, // est. à ajuster
    gutterXcm: 0.2, // est. à ajuster
    gutterYcm: 0.2, // est. à ajuster
  },
  // // ——————————————————————————————————————————
  // // AVEY PRESSETS
  // // ——————————————————————————————————————————

  // {
  //   id: "avery-l7163",
  //   name: "Avery L7163 (14 étiquettes – 99.1 × 38.1 mm)",
  //   rows: 7,
  //   cols: 2,
  //   labelWidthCm: 9.91,
  //   labelHeightCm: 3.81,
  //   marginTopCm: 1.5,
  //   marginLeftCm: 0.6,
  //   gutterXcm: 0.2,
  //   gutterYcm: 0,
  // },

  // {
  //   id: "avery-l7160",
  //   name: "Avery L7160 (21 étiquettes – 63.5 × 38.1 mm)",
  //   rows: 7,
  //   cols: 3,
  //   labelWidthCm: 6.35,
  //   labelHeightCm: 3.81,
  //   marginTopCm: 1.5,
  //   marginLeftCm: 0.35,
  //   gutterXcm: 0.2,
  //   gutterYcm: 0,
  // },

  // {
  //   id: "avery-l7161",
  //   name: "Avery L7161 (18 étiquettes – 63.5 × 46.6 mm)",
  //   rows: 6,
  //   cols: 3,
  //   labelWidthCm: 6.35,
  //   labelHeightCm: 4.66,
  //   marginTopCm: 1.1,
  //   marginLeftCm: 0.35,
  //   gutterXcm: 0.2,
  //   gutterYcm: 0,
  // },

  // {
  //   id: "avery-l7173",
  //   name: "Avery L7173 (8 étiquettes – 99.1 × 67.7 mm)",
  //   rows: 4,
  //   cols: 2,
  //   labelWidthCm: 9.91,
  //   labelHeightCm: 6.77,
  //   marginTopCm: 1.2,
  //   marginLeftCm: 0.6,
  //   gutterXcm: 0.2,
  //   gutterYcm: 0.2,
  // },

  // {
  //   id: "avery-l7165",
  //   name: "Avery L7165 (8 étiquettes – 99.1 × 67.7 mm)",
  //   rows: 4,
  //   cols: 2,
  //   labelWidthCm: 9.91,
  //   labelHeightCm: 6.77,
  //   marginTopCm: 1.5,
  //   marginLeftCm: 0.6,
  //   gutterXcm: 0.2,
  //   gutterYcm: 0.2,
  // },

  // // ——————————————————————————————————————————
  // // AMAZON / GENERIC LOGISTICS
  // // ——————————————————————————————————————————

  // {
  //   id: "amazon-standard",
  //   name: "Amazon A4 6×2 (100 × 40 mm)",
  //   rows: 6,
  //   cols: 2,
  //   labelWidthCm: 10,
  //   labelHeightCm: 4,
  //   marginTopCm: 1,
  //   marginLeftCm: 1,
  //   gutterXcm: 0.5,
  //   gutterYcm: 0.5,
  // },

  // {
  //   id: "amazon-large",
  //   name: "Amazon Large 4×2 (100 × 70 mm)",
  //   rows: 4,
  //   cols: 2,
  //   labelWidthCm: 10,
  //   labelHeightCm: 7,
  //   marginTopCm: 1,
  //   marginLeftCm: 1,
  //   gutterXcm: 0.5,
  //   gutterYcm: 0.5,
  // },

  // {
  //   id: "amazon-small-rect",
  //   name: "Amazon Small 8×3 (60 × 30 mm)",
  //   rows: 8,
  //   cols: 3,
  //   labelWidthCm: 6,
  //   labelHeightCm: 3,
  //   marginTopCm: 0.8,
  //   marginLeftCm: 0.5,
  //   gutterXcm: 0.2,
  //   gutterYcm: 0.2,
  // },

  // // ——————————————————————————————————————————
  // // HERMA (Autocollants EU très courants)
  // // ——————————————————————————————————————————

  // {
  //   id: "herma-4427",
  //   name: "Herma 4427 (12 étiquettes – 97 × 42.3 mm)",
  //   rows: 6,
  //   cols: 2,
  //   labelWidthCm: 9.7,
  //   labelHeightCm: 4.23,
  //   marginTopCm: 1.5,
  //   marginLeftCm: 0.4,
  //   gutterXcm: 0.2,
  //   gutterYcm: 0.2,
  // },

  // {
  //   id: "herma-4452",
  //   name: "Herma 4452 (24 étiquettes – 70 × 32 mm)",
  //   rows: 8,
  //   cols: 3,
  //   labelWidthCm: 7,
  //   labelHeightCm: 3.2,
  //   marginTopCm: 1,
  //   marginLeftCm: 0.4,
  //   gutterXcm: 0.2,
  //   gutterYcm: 0.15,
  // },

  // {
  //   id: "herma-4461",
  //   name: "Herma 4461 (40 étiquettes – 48 × 21 mm)",
  //   rows: 10,
  //   cols: 4,
  //   labelWidthCm: 4.8,
  //   labelHeightCm: 2.1,
  //   marginTopCm: 0.9,
  //   marginLeftCm: 0.5,
  //   gutterXcm: 0.2,
  //   gutterYcm: 0.2,
  // },

  // // ——————————————————————————————————————————
  // // PRESET PERSONNALISABLE
  // // ——————————————————————————————————————————

  // {
  //   id: "custom",
  //   name: "Personnalisé",
  //   rows: 8,
  //   cols: 3,
  //   labelWidthCm: 10,
  //   labelHeightCm: 5,
  //   marginTopCm: 1,
  //   marginLeftCm: 1,
  //   gutterXcm: 0.5,
  //   gutterYcm: 0.5,
  // },
];
