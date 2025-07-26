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

CREATE TABLE catch_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "pokedexEntryId" BIGINT NOT NULL REFERENCES pokedex_entries(id) ON DELETE CASCADE,
  
  -- Catch status fields
  "haveToEvolve" BOOLEAN DEFAULT FALSE,
  caught BOOLEAN DEFAULT FALSE,
  "inHome" BOOLEAN DEFAULT FALSE,
  "hasGigantamaxed" BOOLEAN DEFAULT FALSE,
  "personalNotes" TEXT,
  
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per user per pokemon entry
  UNIQUE("userId", "pokedexEntryId")
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

-- Enable RLS on all tables
ALTER TABLE pokedex_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE catch_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE region_game_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE metadata ENABLE ROW LEVEL SECURITY;

-- RLS policies for pokedex_entries (public read)
CREATE POLICY "Anyone can view pokemon entries" ON pokedex_entries
  FOR SELECT USING (true);

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
