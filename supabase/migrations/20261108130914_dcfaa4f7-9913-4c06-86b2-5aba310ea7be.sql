ALTER TABLE public.race_results ALTER COLUMN points TYPE numeric USING points::numeric;
ALTER TABLE public.race_results_archive ALTER COLUMN points TYPE numeric USING points::numeric;
ALTER TABLE public.previous_standings ALTER COLUMN total_points TYPE numeric USING total_points::numeric;