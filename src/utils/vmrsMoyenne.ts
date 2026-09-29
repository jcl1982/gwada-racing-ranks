import { Race } from '@/types/championship';

/**
 * VMRS : ne conserve que les résultats courus dans la moyenne demandée.
 * Un résultat sans moyenne explicite n'est jamais rattaché par défaut.
 */
export const filterRacesByMoyenne = (list: Race[], moyenne: string): Race[] =>
  list.map((r) => ({
    ...r,
    results: (r.results || []).filter((res) => res.moyenne === moyenne),
  }));
