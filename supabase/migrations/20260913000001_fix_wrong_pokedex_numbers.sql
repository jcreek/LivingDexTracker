-- Correct two mis-seeded national dex numbers, verified against PokeAPI
-- (pokemon-species ids: wyrdeer = 899, ursaluna = 901, gimmighoul = 999).
--
-- Wyrdeer was seeded at 999 - Gimmighoul's number - and national dex 899 was absent from the
-- data entirely. Its spriteKey was likewise '999', so Wyrdeer rendered Gimmighoul's artwork
-- (static/sprites-small/home/999.webp); both fields are corrected here.
--
-- Ursaluna's Bloodmoon form was seeded at 902, which is Basculegion's number. Only the
-- pokedexNumber is wrong - its spriteKey '10272' (ursaluna-bloodmoon) is already correct.
--
-- Safe to renumber: pokedexNumber lives only on pokemon and the two views derived from it.
-- Dex membership (game_pokedex_entries) and user catch records reference pokemon.id, so no
-- dex contents or caught//uncaught state are affected.
--
-- A full audit of all 1390 pokemon rows against PokeAPI (1025 species / 1351 varieties)
-- found no other incorrect dex numbers, no other spriteKey pointing at the wrong species,
-- and no canGigantamax mismatches.

CREATE OR REPLACE FUNCTION pg_temp.fix_dex_number(
  p_old_number INTEGER,
  p_pokemon TEXT,
  p_form TEXT,
  p_new_number INTEGER,
  p_new_sprite_key TEXT
) RETURNS void AS $$
DECLARE
  affected INTEGER;
BEGIN
  -- Matching either the old or the new number keeps this re-runnable: a second run is a
  -- no-op update of an already-corrected row rather than a hard failure, while 0 or 2+
  -- matches (a typo, or real corruption) still raise.
  UPDATE pokemon
  SET "pokedexNumber" = p_new_number,
      "spriteKey" = COALESCE(p_new_sprite_key, "spriteKey")
  WHERE "pokedexNumber" IN (p_old_number, p_new_number)
    AND pokemon = p_pokemon
    AND form IS NOT DISTINCT FROM p_form;

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN
    RAISE EXCEPTION 'fix_dex_number: expected exactly 1 row for pokemon=%, form=%, pokedexNumber=%, got %',
      p_pokemon, p_form, p_old_number, affected;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Wyrdeer: 999 -> 899, and its sprite from Gimmighoul's '999' to its own '899'.
SELECT pg_temp.fix_dex_number(999, 'Wyrdeer', NULL, 899, '899');

-- Ursaluna Bloodmoon: 902 -> 901 (spriteKey already correct, left untouched).
SELECT pg_temp.fix_dex_number(902, 'Ursaluna', 'Bloodmoon', 901, NULL);

DROP FUNCTION pg_temp.fix_dex_number(INTEGER, TEXT, TEXT, INTEGER, TEXT);
