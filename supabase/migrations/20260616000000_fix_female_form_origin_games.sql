-- Fix missing female form entries in pokemon_origin_games.
--
-- Female Sneasel was absent from all Gen 2 games despite the base form being present.
-- Female Indeedee was absent from Sword despite the base form being present.
-- Both were identified by comparing pokemon_origin_games coverage between base forms
-- and their female counterparts.

INSERT INTO pokemon_origin_games ("pokemonId", "gameId")
SELECT p.id, g.id
FROM pokemon p
CROSS JOIN games g
WHERE p.pokemon = 'Sneasel' AND p.form = 'Female'
  AND g."displayName" IN ('Gold', 'Silver', 'Crystal', 'Heart Gold', 'Soul Silver')
ON CONFLICT DO NOTHING;

INSERT INTO pokemon_origin_games ("pokemonId", "gameId")
SELECT p.id, g.id
FROM pokemon p
CROSS JOIN games g
WHERE p.pokemon = 'Indeedee' AND p.form = 'Female'
  AND g."displayName" = 'Sword'
ON CONFLICT DO NOTHING;
