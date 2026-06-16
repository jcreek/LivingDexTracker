-- Fix incorrect and missing game assignments for forms.
--
-- The original seed data recorded only the first game a form appeared in, but
-- the goal is to show all games where a form is actively obtainable. This
-- migration corrects wrong entries and adds missing ones based on in-game
-- mechanics (form-change items, events, wild encounters) verified via Bulbapedia.
--
-- Magearna Original Color: confirmed Home-only reward — no change needed.

-- ============================================================
-- REMOVALS (incorrect existing assignments)
-- ============================================================

-- Rotom appliance forms: introduced in Platinum (Secret Key event).
-- Diamond/Pearl only have base Rotom; the Secret Room mechanic was Platinum-only.
DELETE FROM pokemon_origin_games
WHERE "pokemonId" IN (
    SELECT id FROM pokemon WHERE pokemon = 'Rotom'
    AND form IN ('Fan', 'Fridge', 'Lightbulb', 'Mower', 'Oven', 'Washer')
)
AND "gameId" IN (SELECT id FROM games WHERE "displayName" IN ('Diamond', 'Pearl'));

-- Deoxys: in Gen 3 each form was version-exclusive with no form-change mechanic.
-- Ruby/Sapphire only ever had Normal form. Emerald only had Speed form.
-- Attack form wrong games: Ruby, Sapphire, Emerald, Alpha Sapphire, Omega Ruby.
-- (OR/AS has no Deoxys meteorite mechanic — only Normal form is catchable there.)
DELETE FROM pokemon_origin_games
WHERE "pokemonId" IN (SELECT id FROM pokemon WHERE pokemon = 'Deoxys' AND form = 'Attack Form')
AND "gameId" IN (SELECT id FROM games WHERE "displayName" IN ('Ruby', 'Sapphire', 'Emerald', 'Alpha Sapphire', 'Omega Ruby'));

-- Defense form wrong games: Ruby, Sapphire, Emerald, Alpha Sapphire, Omega Ruby.
DELETE FROM pokemon_origin_games
WHERE "pokemonId" IN (SELECT id FROM pokemon WHERE pokemon = 'Deoxys' AND form = 'Defense Form')
AND "gameId" IN (SELECT id FROM games WHERE "displayName" IN ('Ruby', 'Sapphire', 'Emerald', 'Alpha Sapphire', 'Omega Ruby'));

-- Speed form wrong games: Ruby, Sapphire, Alpha Sapphire, Omega Ruby.
-- (Emerald is correct — Speed form originated there.)
DELETE FROM pokemon_origin_games
WHERE "pokemonId" IN (SELECT id FROM pokemon WHERE pokemon = 'Deoxys' AND form = 'Speed Form')
AND "gameId" IN (SELECT id FROM games WHERE "displayName" IN ('Ruby', 'Sapphire', 'Alpha Sapphire', 'Omega Ruby'));

-- Shaymin Sky Form: Gracidea was not in Diamond/Pearl (Platinum-first).
-- Legends: Arceus has Shaymin only in Land Form — no Gracidea mechanic.
DELETE FROM pokemon_origin_games
WHERE "pokemonId" IN (SELECT id FROM pokemon WHERE pokemon = 'Shaymin' AND form = 'Sky Form')
AND "gameId" IN (SELECT id FROM games WHERE "displayName" IN ('Diamond', 'Pearl', 'Legends: Arceus'));

-- Lycanroc Dusk: required the special Own Tempo Rockruff distributed only in
-- Ultra Sun/Ultra Moon. Not available in the original Sun/Moon.
DELETE FROM pokemon_origin_games
WHERE "pokemonId" IN (SELECT id FROM pokemon WHERE pokemon = 'Lycanroc' AND form = 'Dusk')
AND "gameId" IN (SELECT id FROM games WHERE "displayName" IN ('Sun', 'Moon'));

-- Hoopa Unbound: Prison Bottle was an ORAS-exclusive event item.
-- X/Y had no way to obtain the Prison Bottle; Unbound form was ORAS-only.
DELETE FROM pokemon_origin_games
WHERE "pokemonId" IN (SELECT id FROM pokemon WHERE pokemon = 'Hoopa' AND form = 'Unbound')
AND "gameId" IN (SELECT id FROM games WHERE "displayName" IN ('X', 'Y'));

-- ============================================================
-- ADDITIONS (missing game assignments)
-- ============================================================

-- Rotom appliance forms: form-change mechanic available in each generation:
--   Gen 4: Platinum (Rotom's Room), HG/SS (Silph Co. Rotom's Room)
--   Gen 5: B/W + B2/W2 (Castelia City)
--   Gen 6: X/Y and OR/AS (box method)
--   Gen 7: S/M and US/UM (box method)
--   Gen 8: Sw/Sh, BD/SP (Rotom Catalog key item)
--   Gen 9: Sc/Vi (Rotom Catalog, purchasable at Porto Marinada Market)
INSERT INTO pokemon_origin_games ("pokemonId", "gameId")
SELECT p.id, g.id
FROM pokemon p
CROSS JOIN games g
WHERE p.pokemon = 'Rotom'
  AND p.form IN ('Fan', 'Fridge', 'Lightbulb', 'Mower', 'Oven', 'Washer')
  AND g."displayName" IN (
    'Heart Gold', 'Soul Silver',
    'Black', 'White', 'Black 2', 'White 2',
    'X', 'Y', 'Omega Ruby', 'Alpha Sapphire',
    'Sun', 'Moon', 'Ultra Sun', 'Ultra Moon',
    'Sword', 'Shield',
    'Scarlet', 'Violet'
  )
ON CONFLICT DO NOTHING;

-- Deoxys Attack Form: FireRed-exclusive in Gen 3; meteorite form changes
-- available in Veilstone City (D/P/Pt/BD/SP), Route 3 (HG/SS),
-- Nacrene Museum (B/W/B2/W2), and via meteorites in X/Y.
INSERT INTO pokemon_origin_games ("pokemonId", "gameId")
SELECT p.id, g.id
FROM pokemon p
CROSS JOIN games g
WHERE p.pokemon = 'Deoxys' AND p.form = 'Attack Form'
  AND g."displayName" IN (
    'FireRed',
    'Diamond', 'Pearl', 'Platinum',
    'Heart Gold', 'Soul Silver',
    'Black', 'White', 'Black 2', 'White 2',
    'X', 'Y',
    'Brilliant Diamond', 'Shining Pearl'
  )
ON CONFLICT DO NOTHING;

-- Deoxys Defense Form: LeafGreen-exclusive in Gen 3; same meteorite mechanic above.
INSERT INTO pokemon_origin_games ("pokemonId", "gameId")
SELECT p.id, g.id
FROM pokemon p
CROSS JOIN games g
WHERE p.pokemon = 'Deoxys' AND p.form = 'Defense Form'
  AND g."displayName" IN (
    'LeafGreen',
    'Diamond', 'Pearl', 'Platinum',
    'Heart Gold', 'Soul Silver',
    'Black', 'White', 'Black 2', 'White 2',
    'X', 'Y',
    'Brilliant Diamond', 'Shining Pearl'
  )
ON CONFLICT DO NOTHING;

-- Deoxys Speed Form: Emerald-exclusive in Gen 3 (already in DB); same meteorite mechanic.
INSERT INTO pokemon_origin_games ("pokemonId", "gameId")
SELECT p.id, g.id
FROM pokemon p
CROSS JOIN games g
WHERE p.pokemon = 'Deoxys' AND p.form = 'Speed Form'
  AND g."displayName" IN (
    'Diamond', 'Pearl', 'Platinum',
    'Heart Gold', 'Soul Silver',
    'Black', 'White', 'Black 2', 'White 2',
    'X', 'Y',
    'Brilliant Diamond', 'Shining Pearl'
  )
ON CONFLICT DO NOTHING;

-- Shaymin Land Form: missing HG/SS (Oak's Letter event) and Sc/Vi (Mystery Gift).
INSERT INTO pokemon_origin_games ("pokemonId", "gameId")
SELECT p.id, g.id
FROM pokemon p
CROSS JOIN games g
WHERE p.pokemon = 'Shaymin' AND (p.form = 'Normal Form' OR p.form IS NULL)
  AND g."displayName" IN ('Heart Gold', 'Soul Silver', 'Scarlet', 'Violet')
ON CONFLICT DO NOTHING;

-- Shaymin Sky Form: Gracidea obtainable in Platinum (Floaroma Town), HG/SS
-- (Goldenrod City), X/Y (Snowbelle City), and Sc/Vi (bundled with Mystery Gift).
-- Diamond/Pearl and Legends: Arceus removed above.
INSERT INTO pokemon_origin_games ("pokemonId", "gameId")
SELECT p.id, g.id
FROM pokemon p
CROSS JOIN games g
WHERE p.pokemon = 'Shaymin' AND p.form = 'Sky Form'
  AND g."displayName" IN ('Heart Gold', 'Soul Silver', 'X', 'Y', 'Scarlet', 'Violet')
ON CONFLICT DO NOTHING;

-- Hoopa Confined: distributed via Mystery Gift for all Gen 6 games (X/Y + OR/AS).
INSERT INTO pokemon_origin_games ("pokemonId", "gameId")
SELECT p.id, g.id
FROM pokemon p
CROSS JOIN games g
WHERE p.pokemon = 'Hoopa' AND p.form = 'Confined'
  AND g."displayName" IN ('Omega Ruby', 'Alpha Sapphire')
ON CONFLICT DO NOTHING;

-- Hoopa Unbound: Prison Bottle was an ORAS-exclusive event; X/Y removed above.
INSERT INTO pokemon_origin_games ("pokemonId", "gameId")
SELECT p.id, g.id
FROM pokemon p
CROSS JOIN games g
WHERE p.pokemon = 'Hoopa' AND p.form = 'Unbound'
  AND g."displayName" IN ('Omega Ruby', 'Alpha Sapphire')
ON CONFLICT DO NOTHING;

-- Flabébé/Floette/Florges flower colors: all five colors obtainable in OR/AS
-- (wild encounters confirmed) and US/UM (some via wild, others via SOS/breeding).
-- Not in S/M (Flabébé is absent from base Sun/Moon).
INSERT INTO pokemon_origin_games ("pokemonId", "gameId")
SELECT p.id, g.id
FROM pokemon p
CROSS JOIN games g
WHERE p.pokemon IN ('Flabébé', 'Floette', 'Florges')
  AND p.form IN ('Red', 'Orange', 'Yellow', 'Blue', 'White')
  AND g."displayName" IN ('Omega Ruby', 'Alpha Sapphire', 'Ultra Sun', 'Ultra Moon')
ON CONFLICT DO NOTHING;

-- Furfrou trims: grooming salons confirmed in X/Y (Lumiose City),
-- OR/AS (Slateport City), and S/M + US/UM (Malie City / Hau'oli City).
-- Go entries kept as-is.
INSERT INTO pokemon_origin_games ("pokemonId", "gameId")
SELECT p.id, g.id
FROM pokemon p
CROSS JOIN games g
WHERE p.pokemon = 'Furfrou'
  AND p.form IN ('Dandy', 'Debutante', 'Diamond', 'Heart', 'Kabuki', 'La Reine', 'Matron', 'Pharaoh', 'Star')
  AND g."displayName" IN ('X', 'Y', 'Omega Ruby', 'Alpha Sapphire', 'Sun', 'Moon', 'Ultra Sun', 'Ultra Moon')
ON CONFLICT DO NOTHING;
