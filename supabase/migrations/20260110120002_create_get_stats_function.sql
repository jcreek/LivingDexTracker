-- Create function to get public stats with caching
-- Returns cached stats if fresh (within 24 hours), otherwise refreshes cache

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
    -- Return cached stats
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
