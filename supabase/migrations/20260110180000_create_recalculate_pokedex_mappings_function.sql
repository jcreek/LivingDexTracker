-- Create function to atomically recalculate pokedex entries mapping
-- This function replaces the two-step delete+insert process with a single atomic operation
-- to prevent orphaned pokedexes if repopulation fails or yields an empty list

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
  -- Validate that entry_ids is not empty to avoid accidental deletion
  IF p_entry_ids IS NULL OR array_length(p_entry_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'entry_ids cannot be null or empty';
  END IF;

  -- Verify that the caller owns the target pokedex
  SELECT "userId" INTO v_user_id
  FROM pokedexes
  WHERE id = p_pokedex_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'pokedex not found';
  END IF;

  IF auth.uid() IS NULL OR v_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'not authorized: you do not own this pokedex';
  END IF;

  -- Delete old mappings and insert new mappings in a single transaction
  -- This ensures atomicity - either both operations succeed or both fail
  DELETE FROM pokedex_entries_mapping
  WHERE "pokedexId" = p_pokedex_id;

  INSERT INTO pokedex_entries_mapping ("pokedexId", "pokedexEntryId")
  SELECT p_pokedex_id, unnest(p_entry_ids)
  ON CONFLICT ("pokedexId", "pokedexEntryId") DO NOTHING;
END;
$$;
