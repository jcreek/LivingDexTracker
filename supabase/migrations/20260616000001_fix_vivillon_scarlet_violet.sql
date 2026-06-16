-- Add Scarlet and Violet to all Vivillon pattern forms.
--
-- All 18 pattern forms are obtainable in Scarlet/Violet via the Pokémon Portal
-- Vivillon Points mechanic. The seed data only recorded X/Y (the origin games),
-- which was wrong given the goal is to show all games where a form is catchable.
--
-- Fancy (Event) already has Scarlet/Violet.
-- Pokéball (Event) was X/Y only and is not included here.

INSERT INTO pokemon_origin_games ("pokemonId", "gameId")
SELECT p.id, g.id
FROM pokemon p
CROSS JOIN games g
WHERE p.pokemon = 'Vivillon'
  AND p.form NOT IN ('Fancy (Event)', 'Pokeball (Event)')
  AND g."displayName" IN ('Scarlet', 'Violet')
ON CONFLICT DO NOTHING;
