-- Update stats + mapping functions to use the new normalized schema.
--
-- After [`supabase/migrations/20260116210000_normalize_csv_schema.sql`](supabase/migrations/20260116210000_normalize_csv_schema.sql:1):
--   - catch_records references "pokemonId" (not "pokedexEntryId")
--   - explicit expected entries table is pokedex_pokemon_mapping (not pokedex_entries_mapping)

-- 1) Recalculate function: same name/signature, but targets pokedex_pokemon_mapping.
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

-- 2) Stats functions: completed pokedexes are those where all expected pokemon are caught.
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

