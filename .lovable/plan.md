

## Plan: Admin menu for editing standings titles

### Problem
Standing titles like "Trophée de la Montagne", "Trophée des Rallyes", "Trophée R2", "Trophée Copilote", "Classement Général", "Championnat Karting" are hardcoded across ~14 files. Admins cannot customize them.

### Approach
Store custom titles in the `championship_config` table as a JSON column, load them via the existing config hook, and make them editable from the existing Settings tab in the admin panel.

### Database change
Add a `standings_titles` JSONB column to `championship_config` with default values:
```sql
ALTER TABLE championship_config 
ADD COLUMN standings_titles jsonb DEFAULT '{
  "general": "Classement Général Provisoire",
  "montagne": "Trophée de la Montagne",
  "rallye": "Trophée des Rallyes",
  "r2": "Trophée R2",
  "copilote": "Trophée Copilote"
}'::jsonb;
```

### Code changes

1. **`src/hooks/useChampionshipConfig.ts`** — Extend `ChampionshipConfig` interface to include `standingsTitles` map. Parse the JSON column from Supabase and expose it.

2. **`src/hooks/supabase/configOperations.ts`** — Add `updateStandingsTitles()` function to save the titles JSON to the database.

3. **`src/components/ChampionshipSettings.tsx`** — Add a new card section with input fields for each standings title (Général, Montagne, Rallye, R2, Copilote). Save button calls `updateStandingsTitles()`.

4. **Pass titles through the component tree** — Thread `standingsTitles` from the config hook down through:
   - `ChampionshipApp` → `ViewRenderer` → `RallyeMontagneTabs` / `CategoryStandings` / `KartingStandings` / `R2Standings` / `GeneralStandings`
   - Replace all hardcoded title strings with the dynamic values from config
   - Affected components: `RallyeMontagneTabs`, `CategoryStandings`, `R2Standings`, `GeneralStandings`, `GeneralStandingsHeader`, `CategoryHeader`, `KartingStandings`

5. **Export handlers** — Update PDF, image, and Excel export calls in `RallyeMontagneTabs`, `StandingsTable`, `GeneralStandings` to use dynamic titles instead of hardcoded strings.

### Technical details
- The `standings_titles` JSON keys match standing types: `general`, `montagne`, `rallye`, `r2`, `copilote`
- For karting championships, the same column on the karting config row stores karting-specific titles with keys like `mini60`, `senior`, `kz2`
- Fallback to current hardcoded values if no custom title is set (backward compatibility)
- The Settings tab already exists in the admin panel — we extend `ChampionshipSettings` with the new fields

