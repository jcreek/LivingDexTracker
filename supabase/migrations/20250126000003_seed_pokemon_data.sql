-- Migration: Seed Pokemon data from TSV
-- This replaces the separate tsv-parser project and MongoDB seeding

-- Insert Pokemon data based on the TSV structure
-- Note: This is a sample of the data structure - you'll need to convert the full TSV

INSERT INTO pokedex_entries (
  pokedex_number, 
  pokemon, 
  form, 
  can_gigantamax, 
  region_to_catch_in, 
  games_to_catch_in, 
  region_to_evolve_in, 
  evolution_information,
  box_placement_forms_box,
  box_placement_forms_row,
  box_placement_forms_column,
  box_placement_box,
  box_placement_row,
  box_placement_column
) VALUES
-- Sample data from the TSV (first few entries)
(1, 'Bulbasaur', NULL, FALSE, 'Kanto', ARRAY['Red','Blue','Yellow','LG: Pikachu','LG: Eevee'], NULL, NULL, 1, 1, 1, 1, 1, 1),
(2, 'Ivysaur', NULL, FALSE, 'Kanto', ARRAY['Red','Blue','Yellow','LG: Pikachu','LG: Eevee'], NULL, NULL, 1, 1, 2, 1, 1, 2),
(3, 'Venusaur', NULL, TRUE, 'Kanto', ARRAY['Red','Blue','Yellow','LG: Pikachu','LG: Eevee'], NULL, NULL, 1, 1, 3, 1, 1, 3),
(3, 'Venusaur', 'Female', FALSE, 'Kanto', ARRAY['Red','Blue','Yellow','LG: Pikachu','LG: Eevee'], NULL, NULL, 1, 1, 4, NULL, NULL, NULL),
(4, 'Charmander', NULL, FALSE, 'Kanto', ARRAY['Red','Blue','Yellow','LG: Pikachu','LG: Eevee'], NULL, NULL, 1, 1, 5, 1, 1, 4),
(5, 'Charmeleon', NULL, FALSE, 'Kanto', ARRAY['Red','Blue','Yellow','LG: Pikachu','LG: Eevee'], NULL, NULL, 1, 1, 6, 1, 1, 5),
(6, 'Charizard', NULL, TRUE, 'Kanto', ARRAY['Red','Blue','Yellow','LG: Pikachu','LG: Eevee'], NULL, NULL, 1, 2, 1, 1, 1, 6),
(7, 'Squirtle', NULL, FALSE, 'Kanto', ARRAY['Red','Blue','Yellow','LG: Pikachu','LG: Eevee'], NULL, NULL, 1, 2, 2, 1, 2, 1),
(8, 'Wartortle', NULL, FALSE, 'Kanto', ARRAY['Red','Blue','Yellow','LG: Pikachu','LG: Eevee'], NULL, NULL, 1, 2, 3, 1, 2, 2);

-- Insert region game mappings
INSERT INTO region_game_mappings (region, games) VALUES
('Kanto', ARRAY['Red', 'Blue', 'Yellow', 'LG: Pikachu', 'LG: Eevee']),
('Johto', ARRAY['Gold', 'Silver', 'Crystal', 'HeartGold', 'SoulSilver']),
('Hoenn', ARRAY['Ruby', 'Sapphire', 'Emerald', 'Omega Ruby', 'Alpha Sapphire']),
('Sinnoh', ARRAY['Diamond', 'Pearl', 'Platinum', 'Brilliant Diamond', 'Shining Pearl']),
('Unova', ARRAY['Black', 'White', 'Black 2', 'White 2']),
('Kalos', ARRAY['X', 'Y']),
('Alola', ARRAY['Sun', 'Moon', 'Ultra Sun', 'Ultra Moon']),
('Galar', ARRAY['Sword', 'Shield']),
('Paldea', ARRAY['Scarlet', 'Violet']);

-- Insert some metadata
INSERT INTO pokedex_metadata (key, value) VALUES
('total_pokemon', '{"count": 1025}'),
('last_updated', '{"timestamp": "2025-01-26T00:00:00Z"}'),
('supported_generations', '{"generations": [1,2,3,4,5,6,7,8,9]}');

-- Note: This is a sample seed. For the full migration, we'll need to:
-- 1. Convert the entire TSV file to SQL inserts
-- 2. Or create a function to import from the TSV data directly