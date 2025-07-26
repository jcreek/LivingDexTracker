-- Migration: Create PostgreSQL schema for Pokemon data
-- This replaces the MongoDB collections with proper PostgreSQL tables

-- Note: Using individual columns instead of composite types for simplicity

-- Pokemon entries table (replaces pokedexentries MongoDB collection)
CREATE TABLE pokedex_entries (
  id BIGSERIAL PRIMARY KEY,
  pokedex_number INTEGER NOT NULL,
  pokemon TEXT NOT NULL,
  form TEXT,
  can_gigantamax BOOLEAN DEFAULT FALSE,
  region_to_catch_in TEXT,
  games_to_catch_in TEXT[], -- Array of games
  region_to_evolve_in TEXT,
  evolution_information TEXT,
  catch_information TEXT[], -- Array of catch info
  
  -- Box placement for forms view
  box_placement_forms_box INTEGER,
  box_placement_forms_row INTEGER,
  box_placement_forms_column INTEGER,
  
  -- Box placement for no-forms view
  box_placement_box INTEGER,
  box_placement_row INTEGER,
  box_placement_column INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catch records table (replaces catchrecords MongoDB collection)
CREATE TABLE catch_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pokedex_entry_id BIGINT NOT NULL REFERENCES pokedex_entries(id) ON DELETE CASCADE,
  
  -- Catch status fields
  have_to_evolve BOOLEAN DEFAULT FALSE,
  caught BOOLEAN DEFAULT FALSE,
  in_home BOOLEAN DEFAULT FALSE,
  has_gigantamaxed BOOLEAN DEFAULT FALSE,
  personal_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per user per pokemon entry
  UNIQUE(user_id, pokedex_entry_id)
);

-- Region/Game mappings table (replaces regiongamemappings MongoDB collection)
CREATE TABLE region_game_mappings (
  id BIGSERIAL PRIMARY KEY,
  region TEXT NOT NULL,
  games TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pokedex metadata table (replaces pokedexmetadata MongoDB collection)
CREATE TABLE pokedex_metadata (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for user data isolation
ALTER TABLE catch_records ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own catch records
CREATE POLICY "Users can only access their own catch records" 
ON catch_records FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_pokedex_entries_pokedex_number ON pokedex_entries(pokedex_number);
CREATE INDEX idx_pokedex_entries_pokemon ON pokedex_entries(pokemon);
CREATE INDEX idx_pokedex_entries_box_placement_forms ON pokedex_entries(box_placement_forms_box, box_placement_forms_row, box_placement_forms_column);
CREATE INDEX idx_pokedex_entries_box_placement ON pokedex_entries(box_placement_box, box_placement_row, box_placement_column);

CREATE INDEX idx_catch_records_user_id ON catch_records(user_id);
CREATE INDEX idx_catch_records_pokedex_entry_id ON catch_records(pokedex_entry_id);
CREATE INDEX idx_catch_records_caught ON catch_records(caught);
CREATE INDEX idx_catch_records_in_home ON catch_records(in_home);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_pokedex_entries_updated_at BEFORE UPDATE ON pokedex_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catch_records_updated_at BEFORE UPDATE ON catch_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pokedex_metadata_updated_at BEFORE UPDATE ON pokedex_metadata 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();