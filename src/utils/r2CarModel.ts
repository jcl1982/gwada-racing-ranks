// Vérifie si un modèle de véhicule est éligible au Trophée R2
// (Citroën C2 R2, Renault Twingo R2, ou tout autre modèle estampillé "R2")
export const isR2CarModel = (carModel?: string | null): boolean => {
  if (!carModel) return false;
  const m = carModel.toLowerCase();
  if (!m.includes('r2')) return false;
  return m.includes('c2') || m.includes('twingo') || m.includes('r2');
};
