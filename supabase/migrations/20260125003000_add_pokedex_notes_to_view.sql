-- Add notes column to pokedex_entries view so UI can receive dex notes.
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
  END AS "unownSortOrder",
  p.notes
FROM pokemon p
JOIN regions r ON r.id = p."originRegionId"
LEFT JOIN pokemon_origin_games pog ON pog."pokemonId" = p.id
LEFT JOIN games g ON g.id = pog."gameId"
GROUP BY p.id, r.name, r."releaseOrder";

GRANT SELECT ON pokedex_entries TO anon, authenticated;
