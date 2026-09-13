-- Add an explicit "is this the default/base form" flag to pokemon, so species whose only
-- catchable forms are all named variants (e.g. Basculin's Red/Blue/White-striped,
-- Tornadus/Thundurus/Landorus/Enamorus's Incarnate/Therian, or Oricorio's 4 costumes) can
-- keep their form labels while still having one row treated as the base representative when
-- the "Form Dex (all forms included)" toggle is off. Previously only form IS NULL meant
-- "base form", which forced blanking a form's name (e.g. Darumaka's plain row) to make it
-- default - species with no unnamed form at all (like Basculin) had no base row and were
-- excluded entirely by the base-form filters.

ALTER TABLE pokemon ADD COLUMN IF NOT EXISTS "isDefaultForm" BOOLEAN NOT NULL DEFAULT FALSE;

-- Preserve existing base-form species: every row that was previously the base row still is.
UPDATE pokemon SET "isDefaultForm" = TRUE WHERE form IS NULL;

-- pg_temp function: flags one (pokedexNumber, pokemon, form) row as the default and asserts
-- it matched exactly one row, so a typo'd form string fails the migration loudly instead of
-- silently leaving a species excluded from every non-form dex (exactly the bug being fixed).
CREATE OR REPLACE FUNCTION pg_temp.set_default_form(
  p_pokedex_number INTEGER,
  p_pokemon TEXT,
  p_form TEXT
) RETURNS void AS $$
DECLARE
  affected INTEGER;
BEGIN
  UPDATE pokemon
  SET "isDefaultForm" = TRUE
  WHERE "pokedexNumber" = p_pokedex_number AND pokemon = p_pokemon AND form = p_form;

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN
    RAISE EXCEPTION 'set_default_form: expected exactly 1 row for pokedexNumber=%, pokemon=%, form=%, got %',
      p_pokedex_number, p_pokemon, p_form, affected;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Species that previously had no base-form row at all:
SELECT pg_temp.set_default_form(550, 'Basculin', 'Red-striped');
SELECT pg_temp.set_default_form(641, 'Tornadus', 'Incarnate Form');
SELECT pg_temp.set_default_form(642, 'Thundurus', 'Incarnate Form');
SELECT pg_temp.set_default_form(645, 'Landorus', 'Incarnate Form');
SELECT pg_temp.set_default_form(741, 'Oricorio', 'Baile (Red)');
SELECT pg_temp.set_default_form(905, 'Enamorus', 'Incarnate Form');

-- A full sweep of species with 2+ form rows and none of them form IS NULL turned up the
-- same gap for the following species too (default form chosen per in-game convention: where
-- one form's spriteKey equals the bare pokedexNumber, that form is the game-internal
-- default; otherwise the most common/iconic form is used per the inline notes):

-- spriteKey-matched defaults:
SELECT pg_temp.set_default_form(413, 'Wormadam', 'Leaf Cloak');
SELECT pg_temp.set_default_form(479, 'Rotom', 'Lightbulb');
SELECT pg_temp.set_default_form(492, 'Shaymin', 'Normal Form');
SELECT pg_temp.set_default_form(710, 'Pumpkaboo', 'Medium');
SELECT pg_temp.set_default_form(711, 'Gourgeist', 'Medium');
SELECT pg_temp.set_default_form(718, 'Zygarde', '50%'); -- zygarde-50 is the canonical default form
SELECT pg_temp.set_default_form(720, 'Hoopa', 'Confined');
SELECT pg_temp.set_default_form(745, 'Lycanroc', 'Midday');
SELECT pg_temp.set_default_form(849, 'Toxtricity', 'Amped');
SELECT pg_temp.set_default_form(892, 'Urshifu', 'Single');
SELECT pg_temp.set_default_form(925, 'Maushold', 'Family of 4'); -- matches this dataset's spriteKey convention (924/925), even though SV's own internal form-0 is Family of Three
SELECT pg_temp.set_default_form(931, 'Squawkabilly', 'Green');
SELECT pg_temp.set_default_form(978, 'Tatsugiri', 'Curly');
SELECT pg_temp.set_default_form(982, 'Dudunsparce', '2-Segment');
SELECT pg_temp.set_default_form(999, 'Gimmighoul', 'Box Form'); -- also missing a base row; caught by a full re-sweep grouped by (pokedexNumber, pokemon) rather than pokedexNumber alone, see uniq_pokemon_default_form below

-- No form shares the bare-number spriteKey; default chosen as the in-game form-index-0 /
-- most common appearance instead:
SELECT pg_temp.set_default_form(412, 'Burmy', 'Leaf Cloak'); -- Plant Cloak, form index 0
SELECT pg_temp.set_default_form(422, 'Shellos', 'West Sea'); -- form index 0
SELECT pg_temp.set_default_form(423, 'Gastrodon', 'West Sea'); -- form index 0
SELECT pg_temp.set_default_form(585, 'Deerling', 'Spring'); -- form index 0
SELECT pg_temp.set_default_form(586, 'Sawsbuck', 'Spring'); -- form index 0
SELECT pg_temp.set_default_form(669, 'Flabébé', 'Red'); -- default box-art colour
SELECT pg_temp.set_default_form(670, 'Floette', 'Red');
SELECT pg_temp.set_default_form(671, 'Florges', 'Red');
SELECT pg_temp.set_default_form(774, 'Minior', 'Red'); -- Meteor Form isn't tracked as catchable in this dataset; Red is the conventional default core colour (its spriteKey 10136 is PokeAPI's minior-red default variety)
SELECT pg_temp.set_default_form(666, 'Vivillon', 'Meadow (France-Alsace) [Not Ultra Sun compatible]'); -- most iconic/default pattern (PokeAPI's default variety); NOT this species' true form-index-0 (that's Icy Snow)

-- Phony/Antique pairs share the same spriteKey (visually near-identical); Phony is the
-- common, non-trade-locked form:
SELECT pg_temp.set_default_form(854, 'Sinistea', 'Phony');
SELECT pg_temp.set_default_form(855, 'Polteageist', 'Phony');
SELECT pg_temp.set_default_form(1012, 'Poltchageist', 'Phony');
SELECT pg_temp.set_default_form(1013, 'Sinistcha', 'Phony');

-- Alcremie: 63 cream/sweet combinations, no bare-number spriteKey; the simplest obtainable
-- combination (no Sweet used, default spin direction/time) is used as the default.
SELECT pg_temp.set_default_form(869, 'Alcremie', 'Vanilla Strawberry');

-- These three species already had a working, literal 'male' base-form row (matched by the
-- pre-existing form.eq.male clause in application code) and Unown already had a working
-- 'A' base-form row (matched by a pokemon.eq.Unown-specific clause). Flagging them here too
-- lets every base-form query filter collapse to a single isDefaultForm check instead of
-- special-casing these three species and Unown in five separate places.
SELECT pg_temp.set_default_form(267, 'Beautifly', 'male');
SELECT pg_temp.set_default_form(316, 'Gulpin', 'male');
SELECT pg_temp.set_default_form(317, 'Swalot', 'male');
SELECT pg_temp.set_default_form(201, 'Unown', 'A');

DROP FUNCTION pg_temp.set_default_form(INTEGER, TEXT, TEXT);

-- Enforce the invariant this migration exists to establish: every species has exactly one
-- default form. The partial unique index below only enforces AT MOST one; without this check
-- a future species whose forms are all named would silently regress to the original bug
-- (excluded from every non-form dex) with no error anywhere.
-- Grouped by species name, not (pokedexNumber, pokemon): at this point in the migration
-- chain two species are still split across a wrong pokedexNumber (Ursaluna's Bloodmoon form
-- sits under Basculegion's 902 until 20260913000001 corrects it), and a species is the unit
-- that needs exactly one default regardless of how its rows are numbered.
DO $$
DECLARE
  offenders TEXT;
BEGIN
  SELECT string_agg(pokemon, ', ' ORDER BY pokemon) INTO offenders
  FROM (
    SELECT pokemon FROM pokemon
    GROUP BY pokemon
    HAVING count(*) FILTER (WHERE "isDefaultForm") <> 1
  ) s;

  IF offenders IS NOT NULL THEN
    RAISE EXCEPTION 'these species do not have exactly one default form: %', offenders;
  END IF;
END $$;

-- Add a uniqueness rule for the new flag, kept alongside (not replacing) the existing
-- uniq_pokemon_base_form index. Keyed on (pokedexNumber, pokemon) rather than pokedexNumber
-- alone: when this migration runs, the seed data still has pokedexNumber collisions between
-- unrelated species (Wyrdeer seeded at Gimmighoul's 999; Ursaluna's Bloodmoon form at
-- Basculegion's 902), so a pokedexNumber-only key could not flag a default for the colliding
-- species. The follow-up migration 20260913000001_fix_wrong_pokedex_numbers.sql corrects
-- those two numbers; the composite key is kept because it is the accurate invariant - one
-- default per species - and stays correct regardless of numbering.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_pokemon_default_form
  ON pokemon("pokedexNumber", pokemon)
  WHERE "isDefaultForm";

-- Expose the new flag through pokedex_entries and use it (instead of form IS NULL) to sort
-- the default form first. Mirrors 20260125003000_add_pokedex_notes_to_view.sql, with
-- p."isDefaultForm" appended as the LAST selected column - Postgres requires
-- CREATE OR REPLACE VIEW to keep existing columns in the same name/order/type and only
-- allows new columns to be appended at the end - and the formSortBucket CASE updated to
-- check it (falling back to "form IS NULL" too, so a future INSERT that sets form to NULL
-- without also setting isDefaultForm still sorts correctly).
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
    WHEN p."isDefaultForm" OR p.form IS NULL OR lower(p.form) = 'male' THEN 0
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
  END AS "unownSortOrder",
  p.notes,
  p."isDefaultForm"
FROM pokemon p
JOIN regions r ON r.id = p."originRegionId"
LEFT JOIN pokemon_origin_games pog ON pog."pokemonId" = p.id
LEFT JOIN games g ON g.id = pog."gameId"
GROUP BY p.id, r.name, r."releaseOrder";

GRANT SELECT ON pokedex_entries TO anon, authenticated;

-- game_pokedex_entry_details selects pe.* from pokedex_entries. Postgres expands a view's
-- "*" into a fixed column list AT THE TIME the view is (re)created, not dynamically per
-- query - so it does NOT pick up pokedex_entries' new trailing columns on its own (this is
-- why "notes", added to pokedex_entries by 20260125003000, was never actually visible
-- through this view either). Re-issuing the same definition here forces Postgres to
-- re-expand pe.* against the now-updated pokedex_entries, picking up both "notes" and
-- "isDefaultForm" as new trailing columns.
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
