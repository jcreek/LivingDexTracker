-- Baseline schema for reference data + user data.
-- Replaces legacy migrations; safe to reapply on a fresh database.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to automatically update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Reference data: regions
CREATE TABLE regions (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  "releaseOrder" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Reference data: games
CREATE TABLE games (
  id TEXT PRIMARY KEY,
  "displayName" TEXT NOT NULL UNIQUE,
  "regionId" BIGINT NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
  region TEXT NOT NULL,
  "releaseYear" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_games_region_id ON games("regionId");
CREATE INDEX idx_games_release_year ON games("releaseYear");

-- Reference data: game dexes (base, DLCs, islands, etc.)
CREATE TABLE game_dexes (
  id TEXT PRIMARY KEY,
  "gameId" TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  "displayName" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  "isDlc" BOOLEAN DEFAULT FALSE,
  "parentDexId" TEXT REFERENCES game_dexes(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE ("gameId", "displayName")
);

CREATE INDEX idx_game_dexes_game_id ON game_dexes("gameId");
CREATE INDEX idx_game_dexes_sort_order ON game_dexes("sortOrder");

-- Reference data: pokemon (one row per pokedexNumber + form)
CREATE TABLE pokemon (
  id BIGSERIAL PRIMARY KEY,
  "pokedexNumber" INTEGER NOT NULL,
  pokemon TEXT NOT NULL,
  form TEXT,
  "spriteKey" TEXT,
  "originRegionId" BIGINT NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
  "canGigantamax" BOOLEAN DEFAULT FALSE,
  "regionToEvolveIn" TEXT,
  "evolutionInformation" TEXT,
  "catchInformation" TEXT[],
  notes TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX uniq_pokemon_base_form
  ON pokemon("pokedexNumber")
  WHERE form IS NULL;

CREATE UNIQUE INDEX uniq_pokemon_number_form
  ON pokemon("pokedexNumber", form)
  WHERE form IS NOT NULL;

CREATE INDEX idx_pokemon_pokedex_number ON pokemon("pokedexNumber");
CREATE INDEX idx_pokemon_name ON pokemon(pokemon);
CREATE INDEX idx_pokemon_origin_region_id ON pokemon("originRegionId");

-- Reference data: pokemon origin games (many-to-many)
CREATE TABLE pokemon_origin_games (
  "pokemonId" BIGINT NOT NULL REFERENCES pokemon(id) ON DELETE CASCADE,
  "gameId" TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  PRIMARY KEY ("pokemonId", "gameId")
);

CREATE INDEX idx_pokemon_origin_games_game_id ON pokemon_origin_games("gameId");

-- Reference data: per-game pokedex entries (seeded from per-game CSVs)
CREATE TABLE game_pokedex_entries (
  "dexId" TEXT NOT NULL REFERENCES game_dexes(id) ON DELETE CASCADE,
  "pokemonId" BIGINT NOT NULL REFERENCES pokemon(id) ON DELETE CASCADE,
  "dexNumber" INTEGER,
  notes TEXT,
  PRIMARY KEY ("dexId", "pokemonId")
);

CREATE INDEX idx_game_pokedex_entries_dex_id ON game_pokedex_entries("dexId");
CREATE INDEX idx_game_pokedex_entries_pokemon_id ON game_pokedex_entries("pokemonId");

-- User-owned pokedexes
CREATE TABLE pokedexes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,

  -- Type flags (combinable)
  "isLivingDex" BOOLEAN DEFAULT FALSE,
  "isShinyDex" BOOLEAN DEFAULT FALSE,
  "isOriginDex" BOOLEAN DEFAULT FALSE,
  "isFormDex" BOOLEAN DEFAULT FALSE,

  -- Scope (NULL = all games, or specific game displayName)
  "gameScope" TEXT,

  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE("userId", name)
);

CREATE INDEX idx_pokedexes_user_id ON pokedexes("userId");

-- Selected dex scopes per user pokedex
CREATE TABLE pokedex_dex_scopes (
  "pokedexId" UUID NOT NULL REFERENCES pokedexes(id) ON DELETE CASCADE,
  "dexId" TEXT NOT NULL REFERENCES game_dexes(id) ON DELETE CASCADE,
  PRIMARY KEY ("pokedexId", "dexId")
);

CREATE INDEX idx_pokedex_dex_scopes_pokedex_id ON pokedex_dex_scopes("pokedexId");
CREATE INDEX idx_pokedex_dex_scopes_dex_id ON pokedex_dex_scopes("dexId");

-- User-owned expected entries per pokedex
CREATE TABLE pokedex_pokemon_mapping (
  id BIGSERIAL PRIMARY KEY,
  "pokedexId" UUID NOT NULL REFERENCES pokedexes(id) ON DELETE CASCADE,
  "pokemonId" BIGINT NOT NULL REFERENCES pokemon(id) ON DELETE CASCADE,
  UNIQUE("pokedexId", "pokemonId")
);

CREATE INDEX idx_pokedex_pokemon_mapping_pokedex_id
  ON pokedex_pokemon_mapping("pokedexId");
CREATE INDEX idx_pokedex_pokemon_mapping_pokemon_id
  ON pokedex_pokemon_mapping("pokemonId");

-- User-owned catch records
CREATE TABLE catch_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "pokemonId" BIGINT NOT NULL REFERENCES pokemon(id) ON DELETE CASCADE,
  "pokedexId" UUID NOT NULL REFERENCES pokedexes(id) ON DELETE CASCADE,

  -- Catch status fields
  "haveToEvolve" BOOLEAN DEFAULT FALSE,
  caught BOOLEAN DEFAULT FALSE,
  "inHome" BOOLEAN DEFAULT FALSE,
  "hasGigantamaxed" BOOLEAN DEFAULT FALSE,
  "personalNotes" TEXT,

  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE("userId", "pokemonId", "pokedexId")
);

CREATE INDEX idx_catch_records_user_id ON catch_records("userId");
CREATE INDEX idx_catch_records_pokemon_id ON catch_records("pokemonId");
CREATE INDEX idx_catch_records_pokedex_id ON catch_records("pokedexId");
CREATE INDEX idx_catch_records_caught ON catch_records(caught);
CREATE INDEX idx_catch_records_user_caught ON catch_records("userId", caught);

-- Cached public stats
CREATE TABLE stats_cache (
  id BIGSERIAL PRIMARY KEY,
  pokemon_caught BIGINT NOT NULL DEFAULT 0,
  total_users BIGINT NOT NULL DEFAULT 0,
  completed_pokedexes BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stats_cache_updated_at ON stats_cache(updated_at DESC);

-- Triggers for updatedAt
CREATE TRIGGER update_regions_updated_at
  BEFORE UPDATE ON regions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_dexes_updated_at
  BEFORE UPDATE ON game_dexes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pokemon_updated_at
  BEFORE UPDATE ON pokemon
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pokedexes_updated_at
  BEFORE UPDATE ON pokedexes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catch_records_updated_at
  BEFORE UPDATE ON catch_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Regions are publicly readable" ON regions
  FOR SELECT TO public USING (true);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Games are publicly readable" ON games
  FOR SELECT TO public USING (true);

ALTER TABLE game_dexes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Game dexes are publicly readable" ON game_dexes
  FOR SELECT TO public USING (true);

ALTER TABLE pokemon ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pokemon are publicly readable" ON pokemon
  FOR SELECT TO public USING (true);

ALTER TABLE pokemon_origin_games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pokemon origin games are publicly readable" ON pokemon_origin_games
  FOR SELECT TO public USING (true);

ALTER TABLE game_pokedex_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Game pokedex entries are publicly readable" ON game_pokedex_entries
  FOR SELECT TO public USING (true);

ALTER TABLE pokedexes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own pokedexes" ON pokedexes
  FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "Users can create own pokedexes" ON pokedexes
  FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "Users can update own pokedexes" ON pokedexes
  FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "Users can delete own pokedexes" ON pokedexes
  FOR DELETE USING (auth.uid() = "userId");

ALTER TABLE pokedex_dex_scopes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own dex scopes" ON pokedex_dex_scopes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pokedexes
      WHERE pokedexes.id = pokedex_dex_scopes."pokedexId"
      AND pokedexes."userId" = auth.uid()
    )
  );
CREATE POLICY "Users can manage own dex scopes" ON pokedex_dex_scopes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pokedexes
      WHERE pokedexes.id = pokedex_dex_scopes."pokedexId"
      AND pokedexes."userId" = auth.uid()
    )
  );

ALTER TABLE pokedex_pokemon_mapping ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view pokedex pokemon mapping"
  ON pokedex_pokemon_mapping
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pokedexes
      WHERE pokedexes.id = pokedex_pokemon_mapping."pokedexId"
      AND pokedexes."userId" = auth.uid()
    )
  );
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

ALTER TABLE catch_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own catch records" ON catch_records
  FOR SELECT USING (
    auth.uid() = "userId" AND
    EXISTS (
      SELECT 1 FROM pokedexes
      WHERE pokedexes.id = catch_records."pokedexId"
      AND pokedexes."userId" = auth.uid()
    )
  );
CREATE POLICY "Users can insert own catch records" ON catch_records
  FOR INSERT WITH CHECK (
    auth.uid() = "userId" AND
    EXISTS (
      SELECT 1 FROM pokedexes
      WHERE pokedexes.id = catch_records."pokedexId"
      AND pokedexes."userId" = auth.uid()
    )
  );
CREATE POLICY "Users can update own catch records" ON catch_records
  FOR UPDATE USING (
    auth.uid() = "userId" AND
    EXISTS (
      SELECT 1 FROM pokedexes
      WHERE pokedexes.id = catch_records."pokedexId"
      AND pokedexes."userId" = auth.uid()
    )
  );
CREATE POLICY "Users can delete own catch records" ON catch_records
  FOR DELETE USING (
    auth.uid() = "userId" AND
    EXISTS (
      SELECT 1 FROM pokedexes
      WHERE pokedexes.id = catch_records."pokedexId"
      AND pokedexes."userId" = auth.uid()
    )
  );

ALTER TABLE stats_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view stats cache" ON stats_cache
  FOR SELECT USING (true);

-- Compatibility view for the app (pokedex_entries)
CREATE OR REPLACE VIEW pokedex_entries AS
SELECT
  p.id,
  p."pokedexNumber",
  p.pokemon,
  p.form,
  p."spriteKey",
  p."canGigantamax",
  r.name AS "regionToCatchIn",
  r."releaseOrder" AS "regionReleaseOrder",
  COALESCE(
    ARRAY_AGG(g."displayName" ORDER BY g."displayName") FILTER (WHERE g.id IS NOT NULL),
    ARRAY[]::TEXT[]
  ) AS "gamesToCatchIn",
  p."regionToEvolveIn",
  p."evolutionInformation",
  p."catchInformation",
  p."createdAt",
  p."updatedAt",
  CASE
    WHEN p.form IS NULL OR lower(p.form) = 'male' THEN 0
    WHEN lower(p.form) = 'female' THEN 1
    WHEN lower(p.form) LIKE '%alolan%'
      OR lower(p.form) LIKE '%galarian%'
      OR lower(p.form) LIKE '%hisuian%'
      OR lower(p.form) LIKE '%paldean%'
      THEN 2
    ELSE 3
  END AS "formSortBucket",
  CASE
    WHEN lower(p.form) LIKE '%alolan%'
      OR lower(p.form) LIKE '%galarian%'
      OR lower(p.form) LIKE '%hisuian%'
      OR lower(p.form) LIKE '%paldean%'
      THEN r."releaseOrder"
    ELSE 0
  END AS "formSortRegionOrder",
  CASE
    WHEN lower(p.form) LIKE 'female-%' THEN 1
    ELSE 0
  END AS "formSortRegionalSub",
  COALESCE(lower(p.form), '') AS "formSortLabel",
  CASE
    WHEN p.pokemon = 'Unown' THEN
      CASE
        WHEN p.form = '?' THEN 26
        WHEN p.form = '!' THEN 27
        WHEN length(p.form) = 1 AND ascii(upper(p.form)) BETWEEN 65 AND 90 THEN ascii(upper(p.form)) - 65
        ELSE 28
      END
    ELSE 0
  END AS "unownSortOrder"
FROM pokemon p
JOIN regions r ON r.id = p."originRegionId"
LEFT JOIN pokemon_origin_games pog ON pog."pokemonId" = p.id
LEFT JOIN games g ON g.id = pog."gameId"
GROUP BY p.id, r.name, r."releaseOrder";

GRANT SELECT ON pokedex_entries TO anon, authenticated;

-- Dex-scoped view for ordering and filtering by native dexes
CREATE OR REPLACE VIEW game_pokedex_entry_details AS
SELECT
  gpe."dexId",
  gd."displayName" AS "dexDisplayName",
  gd."sortOrder" AS "dexSortOrder",
  gpe."dexNumber",
  pe.*
FROM game_pokedex_entries gpe
JOIN game_dexes gd ON gd.id = gpe."dexId"
JOIN pokedex_entries pe ON pe.id = gpe."pokemonId";

GRANT SELECT ON game_pokedex_entry_details TO anon, authenticated;

-- RPC: recalculate expected mappings for a pokedex
CREATE OR REPLACE FUNCTION recalculate_pokedex_mappings(
  p_pokedex_id UUID,
  p_entry_ids BIGINT[]
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF p_entry_ids IS NULL OR array_length(p_entry_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'entry_ids cannot be null or empty';
  END IF;

  SELECT "userId" INTO v_user_id
  FROM pokedexes
  WHERE id = p_pokedex_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'pokedex not found';
  END IF;

  IF auth.uid() IS NULL OR v_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'not authorized: you do not own this pokedex';
  END IF;

  DELETE FROM pokedex_pokemon_mapping
  WHERE "pokedexId" = p_pokedex_id;

  INSERT INTO pokedex_pokemon_mapping ("pokedexId", "pokemonId")
  SELECT p_pokedex_id, unnest(p_entry_ids)
  ON CONFLICT ("pokedexId", "pokemonId") DO NOTHING;
END;
$$;

-- RPC: stats cache
CREATE OR REPLACE FUNCTION update_and_get_stats()
RETURNS TABLE (
  pokemon_caught BIGINT,
  total_users BIGINT,
  completed_pokedexes BIGINT,
  updated_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  v_pokemon_caught BIGINT;
  v_total_users BIGINT;
  v_completed_pokedexes BIGINT;
  v_updated_at TIMESTAMPTZ := NOW();
BEGIN
  SELECT COUNT(*) INTO v_pokemon_caught
  FROM catch_records
  WHERE caught = true;

  SELECT COUNT(*) INTO v_total_users
  FROM auth.users;

  SELECT COUNT(*) INTO v_completed_pokedexes
  FROM (
    SELECT cr."pokedexId"
    FROM catch_records cr
    INNER JOIN pokedex_pokemon_mapping ppm
      ON cr."pokedexId" = ppm."pokedexId"
      AND cr."pokemonId" = ppm."pokemonId"
    GROUP BY cr."pokedexId"
    HAVING COUNT(*) = COUNT(*) FILTER (WHERE cr.caught = true)
       AND COUNT(*) = (
         SELECT COUNT(*)
         FROM pokedex_pokemon_mapping
         WHERE "pokedexId" = cr."pokedexId"
       )
  ) completed;

  INSERT INTO stats_cache (id, pokemon_caught, total_users, completed_pokedexes, updated_at)
  VALUES (1, v_pokemon_caught, v_total_users, v_completed_pokedexes, v_updated_at)
  ON CONFLICT (id) DO UPDATE
  SET pokemon_caught = EXCLUDED.pokemon_caught,
      total_users = EXCLUDED.total_users,
      completed_pokedexes = EXCLUDED.completed_pokedexes,
      updated_at = v_updated_at;

  RETURN QUERY
  SELECT v_pokemon_caught, v_total_users, v_completed_pokedexes, v_updated_at AS updated_at;
END;
$$;
REVOKE EXECUTE ON FUNCTION update_and_get_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_and_get_stats() TO service_role;

CREATE OR REPLACE FUNCTION get_public_stats()
RETURNS TABLE (
  pokemon_caught BIGINT,
  total_users BIGINT,
  completed_pokedexes BIGINT,
  updated_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  v_cache_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM stats_cache
    WHERE stats_cache.updated_at > NOW() - INTERVAL '24 hours'
  ) INTO v_cache_exists;

  IF v_cache_exists THEN
    RETURN QUERY
    SELECT sc.pokemon_caught, sc.total_users, sc.completed_pokedexes, sc.updated_at
    FROM stats_cache sc
    ORDER BY sc.updated_at DESC
    LIMIT 1;
  ELSE
    RETURN QUERY
    SELECT * FROM update_and_get_stats();
  END IF;
END;
$$;
