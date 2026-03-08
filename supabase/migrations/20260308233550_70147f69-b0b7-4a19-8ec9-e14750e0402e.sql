
-- Supprimer toutes les archives sauf la dernière sauvegarde de chaque standing_type
DELETE FROM public.race_results_archive
WHERE (standing_type, saved_at) NOT IN (
  SELECT standing_type, MAX(saved_at)
  FROM public.race_results_archive
  GROUP BY standing_type
);

-- Supprimer aussi les previous_standings obsolètes (même logique)
DELETE FROM public.previous_standings
WHERE (standing_type, saved_at) NOT IN (
  SELECT standing_type, MAX(saved_at)
  FROM public.previous_standings
  GROUP BY standing_type
)
AND saved_at IS NOT NULL;
