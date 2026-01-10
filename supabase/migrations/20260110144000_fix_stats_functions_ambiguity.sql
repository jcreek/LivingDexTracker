-- Fix ambiguous column reference errors in stats functions.
--
-- If earlier migrations have already been applied, editing them will not update
-- the deployed database. This migration re-defines the functions using
-- CREATE OR REPLACE so the corrected definitions take effect.

CREATE OR REPLACE FUNCTION update_and_get_stats()
RETURNS TABLE (
  pokemon_caught BIGINT,
  total_users BIGINT,
  completed_pokedexes BIGINT,
  updated_at TIMESTAMPTZ
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_pokemon_caught BIGINT;
  v_total_users BIGINT;
  v_completed_pokedexes BIGINT;
  v_updated_at TIMESTAMPTZ := NOW();
BEGIN
  -- Calculate current stats: count of caught Pokémon
  SELECT COUNT(*) INTO v_pokemon_caught
  FROM catch_records
  WHERE caught = true;

  -- Calculate current stats: count of total users
  SELECT COUNT(*) INTO v_total_users
  FROM auth.users;

  -- Calculate current stats: count of completed pokedexes
  -- A pokedex is completed when all its expected entries have caught = true
  -- Join catch_records to pokedex_entries_mapping to validate against explicit expected entries
  SELECT COUNT(*) INTO v_completed_pokedexes
  FROM (
    SELECT cr."pokedexId"
    FROM catch_records cr
    INNER JOIN pokedex_entries_mapping pem
      ON cr."pokedexId" = pem."pokedexId"
      AND cr."pokedexEntryId" = pem."pokedexEntryId"
    GROUP BY cr."pokedexId"
    HAVING COUNT(*) = COUNT(*) FILTER (WHERE cr.caught = true)
      AND COUNT(*) = (SELECT COUNT(*) FROM pokedex_entries_mapping WHERE "pokedexId" = cr."pokedexId")
  ) completed;

  -- Update cache using UPSERT pattern
  INSERT INTO stats_cache (id, pokemon_caught, total_users, completed_pokedexes, updated_at)
  VALUES (1, v_pokemon_caught, v_total_users, v_completed_pokedexes, v_updated_at)
  ON CONFLICT (id) DO UPDATE
  SET pokemon_caught = EXCLUDED.pokemon_caught,
      total_users = EXCLUDED.total_users,
      completed_pokedexes = EXCLUDED.completed_pokedexes,
      updated_at = v_updated_at;

  -- Return stats
  RETURN QUERY
  SELECT v_pokemon_caught, v_total_users, v_completed_pokedexes, v_updated_at AS updated_at;
END;
$$;


CREATE OR REPLACE FUNCTION get_public_stats()
RETURNS TABLE (
  pokemon_caught BIGINT,
  total_users BIGINT,
  completed_pokedexes BIGINT,
  updated_at TIMESTAMPTZ
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_cache_exists BOOLEAN;
BEGIN
  -- Check if cache exists and is fresh (within 24 hours)
  SELECT EXISTS(
    SELECT 1 FROM stats_cache
    WHERE stats_cache.updated_at > NOW() - INTERVAL '24 hours'
  ) INTO v_cache_exists;

  IF v_cache_exists THEN
    -- Return cached stats (qualify updated_at to avoid ambiguity with output parameter)
    RETURN QUERY
    SELECT sc.pokemon_caught, sc.total_users, sc.completed_pokedexes, sc.updated_at
    FROM stats_cache sc
    ORDER BY sc.updated_at DESC
    LIMIT 1;
  ELSE
    -- Cache is stale or doesn't exist, update it
    RETURN QUERY
    SELECT * FROM update_and_get_stats();
  END IF;
END;
$$;
