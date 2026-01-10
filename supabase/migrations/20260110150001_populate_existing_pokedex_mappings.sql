-- Populate pokedex_entries_mapping for existing pokedexes
-- This is a one-time migration to backfill data for pokedexes created before the mapping table

-- Insert mappings for all existing pokedexes
-- Apply the same filtering logic that the application uses to determine expected entries
INSERT INTO pokedex_entries_mapping ("pokedexId", "pokedexEntryId")
SELECT
  p.id AS "pokedexId",
  pe.id AS "pokedexEntryId"
FROM pokedexes p
CROSS JOIN pokedex_entries pe
WHERE
  -- Form filter: if isFormDex is false, only include base forms
  -- Base forms have form IS NULL, except Unown which has no base form (use 'A')
  (p."isFormDex" = true OR (pe.form IS NULL OR (pe.pokemon = 'Unown' AND pe.form = 'A')))
  -- Game scope filter: if gameScope is specified, filter by game
  AND (p."gameScope" IS NULL OR pe."gamesToCatchIn" @> ARRAY[p."gameScope"]::TEXT[])
  -- Region filter: if gameScope is specified, filter by region
  AND (p."gameScope" IS NULL OR pe."regionToCatchIn" = (
    SELECT region FROM region_game_mappings WHERE game = p."gameScope" LIMIT 1
  ))
ON CONFLICT ("pokedexId", "pokedexEntryId") DO NOTHING;

-- Add comment to document this migration
COMMENT ON TABLE pokedex_entries_mapping IS 'Junction table defining which pokedex_entries belong to each pokedex. Used for accurate stats calculation.';
