-- Deduplicate races_data in season_archives by keeping only unique races (by name + type + date)
UPDATE season_archives
SET races_data = (
  SELECT jsonb_agg(DISTINCT ON_val)
  FROM (
    SELECT DISTINCT ON (r->>'name', r->>'type', r->>'date') r AS ON_val
    FROM jsonb_array_elements(races_data) r
    ORDER BY r->>'name', r->>'type', r->>'date'
  ) sub
)
WHERE id = '58df4378-c2d1-4336-847c-4af3109094be';