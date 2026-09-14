-- Stable capability links for read-only Pokédex sharing.
ALTER TABLE pokedexes
  ADD COLUMN "shareToken" UUID NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE pokedexes
  ADD CONSTRAINT pokedexes_share_token_key UNIQUE ("shareToken");

CREATE OR REPLACE FUNCTION prevent_pokedex_share_token_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW."shareToken" IS DISTINCT FROM OLD."shareToken" THEN
    RAISE EXCEPTION 'shareToken is immutable';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_pokedex_share_token_update
  BEFORE UPDATE OF "shareToken" ON pokedexes
  FOR EACH ROW EXECUTE FUNCTION prevent_pokedex_share_token_update();

-- This is the only anonymous path into user-owned Pokédex data. Keep the returned
-- shape deliberately narrow: no owner identity, row IDs, timestamps, or personal notes.
CREATE OR REPLACE FUNCTION get_shared_pokedex(p_share_token UUID)
RETURNS JSONB
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
LANGUAGE sql
AS $$
  SELECT jsonb_build_object(
    'name', p.name,
    'description', COALESCE(p.description, ''),
    'isLivingDex', COALESCE(p."isLivingDex", false),
    'isShinyDex', COALESCE(p."isShinyDex", false),
    'isOriginDex', COALESCE(p."isOriginDex", false),
    'isFormDex', COALESCE(p."isFormDex", false),
    'gameScope', p."gameScope",
    'dexScopes', COALESCE(
      (
        SELECT jsonb_agg(pds."dexId" ORDER BY pds."dexId")
        FROM pokedex_dex_scopes pds
        WHERE pds."pokedexId" = p.id
      ),
      '[]'::jsonb
    ),
    'catchStatuses', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'pokemonId', cr."pokemonId"::text,
            'caught', COALESCE(cr.caught, false),
            'haveToEvolve', COALESCE(cr."haveToEvolve", false),
            'inHome', COALESCE(cr."inHome", false),
            'hasGigantamaxed', COALESCE(cr."hasGigantamaxed", false)
          )
          ORDER BY cr."pokemonId"
        )
        FROM catch_records cr
        WHERE cr."pokedexId" = p.id
      ),
      '[]'::jsonb
    )
  )
  FROM pokedexes p
  WHERE p."shareToken" = p_share_token;
$$;

REVOKE ALL ON FUNCTION get_shared_pokedex(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_shared_pokedex(UUID) TO anon, authenticated;
