-- Normalize reference data schema to match data/csvs/*.csv
--
-- Target tables (reference data):
--   - regions
--   - games (add regionId FK, keep existing columns)
--   - pokemon (1 row per pokedexNumber + form, matching data/csvs/pokemon.csv)
--   - pokemon_origin_games (join table)
--   - region_game_mappings (join table)
--
-- Also migrates user data table catch_records to reference pokemon instead of pokedex_entries.

-- 1) Drop tables that are being replaced
--
-- NOTE: We intentionally keep auth.users and user-owned pokedexes.
-- Any existing catch_records will be wiped because the foreign key target changes.

TRUNCATE TABLE catch_records;

-- Drop old mapping table (depends on pokedex_entries)
DROP TABLE IF EXISTS pokedex_entries_mapping;

-- Drop old regional dex table (per approved plan)
DROP TABLE IF EXISTS regional_dex_numbers;

-- Drop old region-game mappings (string-based)
DROP TABLE IF EXISTS region_game_mappings;

-- Drop old pokedex entries table (legacy, replaced by pokemon)
DROP TABLE IF EXISTS pokedex_entries;

-- 2) Regions
CREATE TABLE IF NOT EXISTS regions (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Regions are publicly readable" ON regions
  FOR SELECT TO public USING (true);

CREATE TRIGGER update_regions_updated_at
  BEFORE UPDATE ON regions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3) Games: keep existing id + displayName, add regionId FK
ALTER TABLE games
  ADD COLUMN IF NOT EXISTS "regionId" BIGINT;

ALTER TABLE games
  ADD CONSTRAINT games_region_id_fkey
  FOREIGN KEY ("regionId") REFERENCES regions(id)
  ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_games_region_id ON games("regionId");

-- 4) Region ↔ Game mapping (normalized)
CREATE TABLE IF NOT EXISTS region_game_mappings (
  "regionId" BIGINT NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  "gameId" TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  PRIMARY KEY ("regionId", "gameId")
);

ALTER TABLE region_game_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Region-game mappings are publicly readable" ON region_game_mappings
  FOR SELECT TO public USING (true);

CREATE INDEX IF NOT EXISTS idx_region_game_mappings_game_id ON region_game_mappings("gameId");

-- 5) Pokemon (1 row per pokedexNumber + form)
CREATE TABLE IF NOT EXISTS pokemon (
  id BIGSERIAL PRIMARY KEY,
  "pokedexNumber" INTEGER NOT NULL,
  pokemon TEXT NOT NULL,
  form TEXT,
  "originRegionId" BIGINT NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
  "canGigantamax" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Uniqueness: exactly one "base" (form IS NULL) per pokedex number
CREATE UNIQUE INDEX IF NOT EXISTS uniq_pokemon_base_form
  ON pokemon("pokedexNumber")
  WHERE form IS NULL;

-- Uniqueness: for non-null forms, unique per (pokedexNumber, form)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_pokemon_number_form
  ON pokemon("pokedexNumber", form)
  WHERE form IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pokemon_pokedex_number ON pokemon("pokedexNumber");
CREATE INDEX IF NOT EXISTS idx_pokemon_name ON pokemon(pokemon);
CREATE INDEX IF NOT EXISTS idx_pokemon_origin_region_id ON pokemon("originRegionId");

ALTER TABLE pokemon ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pokemon are publicly readable" ON pokemon
  FOR SELECT TO public USING (true);

CREATE TRIGGER update_pokemon_updated_at
  BEFORE UPDATE ON pokemon
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6) Pokemon ↔ origin games (normalized)
CREATE TABLE IF NOT EXISTS pokemon_origin_games (
  "pokemonId" BIGINT NOT NULL REFERENCES pokemon(id) ON DELETE CASCADE,
  "gameId" TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  PRIMARY KEY ("pokemonId", "gameId")
);

ALTER TABLE pokemon_origin_games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pokemon origin games are publicly readable" ON pokemon_origin_games
  FOR SELECT TO public USING (true);

CREATE INDEX IF NOT EXISTS idx_pokemon_origin_games_game_id ON pokemon_origin_games("gameId");

-- 6.1) Compatibility view: keep the app working while refactoring
--
-- This view matches the old pokedex_entries shape used by the app:
--  - id (BIGINT)
--  - "pokedexNumber"
--  - pokemon
--  - form
--  - "canGigantamax"
--  - "regionToCatchIn" (region name)
--  - "gamesToCatchIn" (TEXT[] of game display names)
--  - "createdAt" / "updatedAt"
--
-- Note: read-only. Inserts/updates should target the new tables.
CREATE OR REPLACE VIEW pokedex_entries AS
SELECT
  p.id,
  p."pokedexNumber",
  p.pokemon,
  p.form,
  p."canGigantamax",
  r.name AS "regionToCatchIn",
  COALESCE(
    ARRAY_AGG(g."displayName" ORDER BY g."displayName") FILTER (WHERE g.id IS NOT NULL),
    ARRAY[]::TEXT[]
  ) AS "gamesToCatchIn",
  p."createdAt",
  p."updatedAt"
FROM pokemon p
JOIN regions r ON r.id = p."originRegionId"
LEFT JOIN pokemon_origin_games pog ON pog."pokemonId" = p.id
LEFT JOIN games g ON g.id = pog."gameId"
GROUP BY p.id, r.name;

-- RLS: views respect underlying table policies; keep it explicitly public readable
GRANT SELECT ON pokedex_entries TO anon, authenticated;

-- 7) Recreate pokedex mapping table for expected entries
-- (same intent as old pokedex_entries_mapping, but points at pokemon.id)
CREATE TABLE IF NOT EXISTS pokedex_pokemon_mapping (
  id BIGSERIAL PRIMARY KEY,
  "pokedexId" UUID NOT NULL REFERENCES pokedexes(id) ON DELETE CASCADE,
  "pokemonId" BIGINT NOT NULL REFERENCES pokemon(id) ON DELETE CASCADE,
  UNIQUE("pokedexId", "pokemonId")
);

CREATE INDEX IF NOT EXISTS idx_pokedex_pokemon_mapping_pokedex_id
  ON pokedex_pokemon_mapping("pokedexId");
CREATE INDEX IF NOT EXISTS idx_pokedex_pokemon_mapping_pokemon_id
  ON pokedex_pokemon_mapping("pokemonId");

ALTER TABLE pokedex_pokemon_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pokedex pokemon mapping"
  ON pokedex_pokemon_mapping
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own pokedex pokemon mappings"
  ON pokedex_pokemon_mapping
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pokedexes
      WHERE pokedexes.id = pokedex_pokemon_mapping."pokedexId"
      AND pokedexes."userId" = auth.uid()
    )
  );

CREATE POLICY "Users can delete own pokedex pokemon mappings"
  ON pokedex_pokemon_mapping
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM pokedexes
      WHERE pokedexes.id = pokedex_pokemon_mapping."pokedexId"
      AND pokedexes."userId" = auth.uid()
    )
  );

-- 8) Update catch_records to reference pokemon instead of pokedex_entries
ALTER TABLE catch_records
  DROP COLUMN IF EXISTS "pokedexEntryId";

ALTER TABLE catch_records
  ADD COLUMN IF NOT EXISTS "pokemonId" BIGINT REFERENCES pokemon(id) ON DELETE CASCADE;

ALTER TABLE catch_records
  ALTER COLUMN "pokemonId" SET NOT NULL;

-- Drop old unique constraint (name may vary across environments)
ALTER TABLE catch_records
  DROP CONSTRAINT IF EXISTS catch_records_user_pokemon_pokedex_unique;

ALTER TABLE catch_records
  ADD CONSTRAINT catch_records_user_pokemon_pokedex_unique
  UNIQUE("userId", "pokemonId", "pokedexId");

CREATE INDEX IF NOT EXISTS idx_catch_records_pokemon_id ON catch_records("pokemonId");
