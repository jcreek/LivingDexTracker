-- User pokédexes table
CREATE TABLE user_pokedexes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  
  -- Game scope configuration
  game_scope TEXT NOT NULL CHECK (game_scope IN ('all_games', 'specific_generation')),
  generation TEXT, -- Only set if game_scope = 'specific_generation'
  
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

-- Add pokedex_id to catch_records
ALTER TABLE catch_records 
ADD COLUMN pokedex_id UUID REFERENCES user_pokedexes(id) ON DELETE CASCADE;

-- Update unique constraint to include pokedex_id
ALTER TABLE catch_records 
DROP CONSTRAINT catch_records_userId_pokedexEntryId_key;

ALTER TABLE catch_records 
ADD CONSTRAINT unique_user_pokemon_pokedex 
UNIQUE("userId", "pokedexEntryId", pokedex_id);

-- Create indexes
CREATE INDEX idx_user_pokedexes_user_id ON user_pokedexes(user_id);
CREATE INDEX idx_catch_records_pokedex_id ON catch_records(pokedex_id);

-- RLS policies
ALTER TABLE user_pokedexes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pokedexes" ON user_pokedexes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pokedexes" ON user_pokedexes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pokedexes" ON user_pokedexes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pokedexes" ON user_pokedexes
  FOR DELETE USING (auth.uid() = user_id);

-- Data migration: Create default pokédex for existing users
INSERT INTO user_pokedexes (user_id, name, game_scope, is_shiny, require_origin, include_forms)
SELECT DISTINCT 
  "userId",
  'My Living Dex',
  'all_games',
  FALSE,
  FALSE,
  FALSE
FROM catch_records;

-- Link existing catch records to default pokédex
UPDATE catch_records 
SET pokedex_id = up.id
FROM user_pokedexes up
WHERE catch_records."userId" = up.user_id 
  AND up.name = 'My Living Dex'
  AND catch_records.pokedex_id IS NULL;

-- Make pokedex_id NOT NULL after migration
ALTER TABLE catch_records ALTER COLUMN pokedex_id SET NOT NULL;
