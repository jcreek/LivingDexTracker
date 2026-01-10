-- Create function to calculate and update stats in the cache table
-- This function runs the expensive queries and stores the results

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
BEGIN
  -- Calculate current stats: count of caught Pokémon
  SELECT COUNT(*) INTO v_pokemon_caught
  FROM catch_records
  WHERE caught = true;

  -- Calculate current stats: count of total users
  SELECT COUNT(*) INTO v_total_users
  FROM auth.users;

  -- Calculate current stats: count of completed pokedexes
  -- A pokedex is completed when all its entries have caught = true
  SELECT COUNT(*) INTO v_completed_pokedexes
  FROM (
    SELECT pokedexId
    FROM catch_records
    GROUP BY pokedexId
    HAVING COUNT(*) = COUNT(*) FILTER (WHERE caught = true)
  ) completed;

  -- Update cache using UPSERT pattern
  INSERT INTO stats_cache (pokemon_caught, total_users, completed_pokedexes, updated_at)
  VALUES (v_pokemon_caught, v_total_users, v_completed_pokedexes, NOW())
  ON CONFLICT (id) DO UPDATE
  SET pokemon_caught = EXCLUDED.pokemon_caught,
      total_users = EXCLUDED.total_users,
      completed_pokedexes = EXCLUDED.completed_pokedexes,
      updated_at = NOW();

  -- Return the stats
  RETURN QUERY
  SELECT v_pokemon_caught, v_total_users, v_completed_pokedexes, NOW() AS updated_at;
END;
$$;
