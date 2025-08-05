CREATE TABLE pokedex_entries (
  id BIGSERIAL PRIMARY KEY,
  "pokedexNumber" INTEGER NOT NULL,
  pokemon TEXT NOT NULL,
  form TEXT,
  "canGigantamax" BOOLEAN DEFAULT FALSE,
  "regionToCatchIn" TEXT,
  "gamesToCatchIn" TEXT[],
  "regionToEvolveIn" TEXT,
  "evolutionInformation" TEXT,
  "catchInformation" TEXT[],
  
  -- Regional pokedex numbers
  kanto_number INTEGER,
  johto_number INTEGER,
  hoenn_number INTEGER,
  sinnoh_number INTEGER,
  sinnoh_extended_number INTEGER,
  unova_number INTEGER,
  unova_updated_number INTEGER,
  kalos_central_number INTEGER,
  kalos_coastal_number INTEGER,
  kalos_mountain_number INTEGER,
  hoenn_updated_number INTEGER,
  alola_number INTEGER,
  alola_updated_number INTEGER,
  melemele_number INTEGER,
  akala_number INTEGER,
  ulaula_number INTEGER,
  poni_number INTEGER,
  galar_number INTEGER,
  isle_armor_number INTEGER,
  crown_tundra_number INTEGER,
  hisui_number INTEGER,
  paldea_number INTEGER,
  kitakami_number INTEGER,
  blueberry_number INTEGER,
  
  -- Box placement for forms view
  "boxPlacementFormsBox" INTEGER,
  "boxPlacementFormsRow" INTEGER,
  "boxPlacementFormsColumn" INTEGER,
  
  -- Box placement for no-forms view
  "boxPlacementBox" INTEGER,
  "boxPlacementRow" INTEGER,
  "boxPlacementColumn" INTEGER,
  
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint to prevent duplicate pokemon forms
ALTER TABLE pokedex_entries ADD CONSTRAINT unique_pokemon_form 
  UNIQUE("pokedexNumber", form);

-- Regional pokedex metadata (must be created before user_pokedexes)
CREATE TABLE regional_pokedex_info (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  column_name TEXT NOT NULL,
  region TEXT,
  generation TEXT,
  games TEXT[],
  total_pokemon INTEGER,
  pokeapi_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert regional pokedex metadata
INSERT INTO regional_pokedex_info (name, display_name, column_name, region, generation, games, total_pokemon, pokeapi_id) VALUES
('national', 'National Pokédex', 'pokedexNumber', NULL, NULL, '{}', 1025, 1),
('kanto', 'Kanto Pokédex', 'kanto_number', 'kanto', 'gen1', '{"red", "blue", "yellow", "firered", "leafgreen", "lets-go-pikachu", "lets-go-eevee"}', 151, 2),
('johto', 'Johto Pokédex', 'johto_number', 'johto', 'gen2', '{"gold", "silver", "crystal", "heartgold", "soulsilver"}', 256, 3),
('hoenn', 'Hoenn Pokédex', 'hoenn_number', 'hoenn', 'gen3', '{"ruby", "sapphire", "emerald"}', 202, 4),
('sinnoh', 'Sinnoh Pokédex', 'sinnoh_number', 'sinnoh', 'gen4', '{"diamond", "pearl"}', 151, 5),
('sinnoh-extended', 'Extended Sinnoh Pokédex', 'sinnoh_extended_number', 'sinnoh', 'gen4', '{"platinum", "brilliant-diamond", "shining-pearl"}', 210, 6),
('unova', 'Unova Pokédex', 'unova_number', 'unova', 'gen5', '{"black", "white"}', 156, 8),
('unova-updated', 'Updated Unova Pokédex', 'unova_updated_number', 'unova', 'gen5', '{"black-2", "white-2"}', 301, 9),
('kalos-central', 'Kalos Central Pokédex', 'kalos_central_number', 'kalos', 'gen6', '{"x", "y"}', 150, 12),
('kalos-coastal', 'Kalos Coastal Pokédex', 'kalos_coastal_number', 'kalos', 'gen6', '{"x", "y"}', 153, 13),
('kalos-mountain', 'Kalos Mountain Pokédex', 'kalos_mountain_number', 'kalos', 'gen6', '{"x", "y"}', 147, 14),
('hoenn-updated', 'Updated Hoenn Pokédex', 'hoenn_updated_number', 'hoenn', 'gen6', '{"omega-ruby", "alpha-sapphire"}', 211, 15),
('alola', 'Alola Pokédex', 'alola_number', 'alola', 'gen7', '{"sun", "moon"}', 301, 16),
('alola-updated', 'Updated Alola Pokédex', 'alola_updated_number', 'alola', 'gen7', '{"ultra-sun", "ultra-moon"}', 403, 21),
('melemele', 'Melemele Pokédex', 'melemele_number', 'alola', 'gen7', '{"sun", "moon", "ultra-sun", "ultra-moon"}', 120, 17),
('akala', 'Akala Pokédex', 'akala_number', 'alola', 'gen7', '{"sun", "moon", "ultra-sun", "ultra-moon"}', 130, 18),
('ulaula', 'Ulaula Pokédex', 'ulaula_number', 'alola', 'gen7', '{"sun", "moon", "ultra-sun", "ultra-moon"}', 130, 19),
('poni', 'Poni Pokédex', 'poni_number', 'alola', 'gen7', '{"sun", "moon", "ultra-sun", "ultra-moon"}', 100, 20),
('galar', 'Galar Pokédex', 'galar_number', 'galar', 'gen8', '{"sword", "shield"}', 400, 27),
('isle-armor', 'Isle of Armor Pokédex', 'isle_armor_number', 'galar', 'gen8', '{"sword", "shield"}', 211, 28),
('crown-tundra', 'Crown Tundra Pokédex', 'crown_tundra_number', 'galar', 'gen8', '{"sword", "shield"}', 210, 29),
('hisui', 'Hisui Pokédex', 'hisui_number', 'hisui', 'gen8', '{"legends-arceus"}', 242, 30),
('paldea', 'Paldea Pokédex', 'paldea_number', 'paldea', 'gen9', '{"scarlet", "violet"}', 400, 31),
('kitakami', 'Kitakami Pokédex', 'kitakami_number', 'paldea', 'gen9', '{"scarlet", "violet"}', 200, 32),
('blueberry', 'Blueberry Academy Pokédex', 'blueberry_number', 'paldea', 'gen9', '{"scarlet", "violet"}', 243, 33);

-- User pokédexes table
CREATE TABLE user_pokedexes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  
  -- Game scope configuration
  game_scope TEXT NOT NULL CHECK (game_scope IN ('all_games', 'specific_generation')),
  generation TEXT, -- Only set if game_scope = 'specific_generation'
  
  -- Regional pokedex selection
  regional_pokedex_name TEXT NOT NULL DEFAULT 'national' REFERENCES regional_pokedex_info(name),
  
  -- Pokémon type configuration
  is_shiny BOOLEAN NOT NULL DEFAULT FALSE,
  require_origin BOOLEAN NOT NULL DEFAULT FALSE, -- Only applicable for all_games
  include_forms BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, name),
  CHECK (
    (game_scope = 'all_games' AND generation IS NULL) OR
    (game_scope = 'specific_generation' AND generation IS NOT NULL)
  ),
  CHECK (
    (game_scope = 'all_games') OR 
    (game_scope = 'specific_generation' AND require_origin = FALSE)
  )
);

CREATE TABLE catch_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "pokedexEntryId" BIGINT NOT NULL REFERENCES pokedex_entries(id) ON DELETE CASCADE,
  pokedex_id UUID NOT NULL REFERENCES user_pokedexes(id) ON DELETE CASCADE,
  
  -- Catch status fields
  "haveToEvolve" BOOLEAN DEFAULT FALSE,
  caught BOOLEAN DEFAULT FALSE,
  "inHome" BOOLEAN DEFAULT FALSE,
  "hasGigantamaxed" BOOLEAN DEFAULT FALSE,
  "personalNotes" TEXT,
  
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per user per pokemon entry per pokédex
  UNIQUE("userId", "pokedexEntryId", pokedex_id)
);

CREATE TABLE region_game_mappings (
  id BIGSERIAL PRIMARY KEY,
  region TEXT NOT NULL,
  game TEXT NOT NULL,
  UNIQUE(region, game)
);

CREATE TABLE metadata (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);


-- Create indexes for better performance
CREATE INDEX idx_pokedex_entries_pokedex_number ON pokedex_entries("pokedexNumber");
CREATE INDEX idx_pokedex_entries_pokemon ON pokedex_entries(pokemon);
CREATE INDEX idx_pokedex_entries_box_placement_forms ON pokedex_entries("boxPlacementFormsBox", "boxPlacementFormsRow", "boxPlacementFormsColumn");
CREATE INDEX idx_pokedex_entries_box_placement ON pokedex_entries("boxPlacementBox", "boxPlacementRow", "boxPlacementColumn");

-- Regional pokedex indexes
CREATE INDEX idx_pokedex_entries_kanto_number ON pokedex_entries(kanto_number) WHERE kanto_number IS NOT NULL;
CREATE INDEX idx_pokedex_entries_johto_number ON pokedex_entries(johto_number) WHERE johto_number IS NOT NULL;
CREATE INDEX idx_pokedex_entries_hoenn_number ON pokedex_entries(hoenn_number) WHERE hoenn_number IS NOT NULL;
CREATE INDEX idx_pokedex_entries_sinnoh_number ON pokedex_entries(sinnoh_number) WHERE sinnoh_number IS NOT NULL;
CREATE INDEX idx_pokedex_entries_unova_number ON pokedex_entries(unova_number) WHERE unova_number IS NOT NULL;
CREATE INDEX idx_pokedex_entries_kalos_central_number ON pokedex_entries(kalos_central_number) WHERE kalos_central_number IS NOT NULL;
CREATE INDEX idx_pokedex_entries_kalos_coastal_number ON pokedex_entries(kalos_coastal_number) WHERE kalos_coastal_number IS NOT NULL;
CREATE INDEX idx_pokedex_entries_kalos_mountain_number ON pokedex_entries(kalos_mountain_number) WHERE kalos_mountain_number IS NOT NULL;
CREATE INDEX idx_pokedex_entries_alola_number ON pokedex_entries(alola_number) WHERE alola_number IS NOT NULL;
CREATE INDEX idx_pokedex_entries_galar_number ON pokedex_entries(galar_number) WHERE galar_number IS NOT NULL;
CREATE INDEX idx_pokedex_entries_hisui_number ON pokedex_entries(hisui_number) WHERE hisui_number IS NOT NULL;
CREATE INDEX idx_pokedex_entries_paldea_number ON pokedex_entries(paldea_number) WHERE paldea_number IS NOT NULL;

CREATE INDEX idx_catch_records_user_id ON catch_records("userId");
CREATE INDEX idx_catch_records_pokedex_entry_id ON catch_records("pokedexEntryId");
CREATE INDEX idx_catch_records_caught ON catch_records(caught);
CREATE INDEX idx_catch_records_in_home ON catch_records("inHome");
CREATE INDEX idx_catch_records_user_caught ON catch_records("userId", caught);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_pokedex_entries_updated_at 
    BEFORE UPDATE ON pokedex_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catch_records_updated_at 
    BEFORE UPDATE ON catch_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_pokedexes_updated_at 
    BEFORE UPDATE ON user_pokedexes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_user_pokedexes_user_id ON user_pokedexes(user_id);
CREATE INDEX idx_user_pokedexes_regional_pokedex_name ON user_pokedexes(regional_pokedex_name);
CREATE INDEX idx_catch_records_pokedex_id ON catch_records(pokedex_id);
CREATE INDEX idx_regional_pokedex_info_name ON regional_pokedex_info(name);

-- Enable RLS on all tables
ALTER TABLE pokedex_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pokedexes ENABLE ROW LEVEL SECURITY;
ALTER TABLE catch_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE region_game_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_pokedex_info ENABLE ROW LEVEL SECURITY;

-- RLS policies for pokedex_entries (public read)
CREATE POLICY "Anyone can view pokemon entries" ON pokedex_entries
  FOR SELECT USING (true);

-- RLS policies for user_pokedexes (user-specific)
CREATE POLICY "Users can view own pokedexes" ON user_pokedexes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pokedexes" ON user_pokedexes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pokedexes" ON user_pokedexes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pokedexes" ON user_pokedexes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for catch_records (user-specific)
CREATE POLICY "Users can view own catch records" ON catch_records
  FOR SELECT USING (auth.uid() = "userId");

CREATE POLICY "Users can insert own catch records" ON catch_records
  FOR INSERT WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update own catch records" ON catch_records
  FOR UPDATE USING (auth.uid() = "userId");

CREATE POLICY "Users can delete own catch records" ON catch_records
  FOR DELETE USING (auth.uid() = "userId");

-- RLS policies for region_game_mappings (public read)
CREATE POLICY "Anyone can view region game mappings" ON region_game_mappings
  FOR SELECT USING (true);

-- RLS policies for metadata (public read)
CREATE POLICY "Anyone can view metadata" ON metadata
  FOR SELECT USING (true);

-- RLS policies for regional_pokedex_info (public read)
CREATE POLICY "Anyone can view regional pokedex info" ON regional_pokedex_info
  FOR SELECT USING (true);
