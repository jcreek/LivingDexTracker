-- Add pokedex_entries_mapping table to explicitly define which entries belong to each pokedex
-- This fixes the stats functions ambiguity issue by providing an explicit definition of expected entries

-- Create pokedex_entries_mapping table
CREATE TABLE pokedex_entries_mapping (
  id BIGSERIAL PRIMARY KEY,
  "pokedexId" UUID NOT NULL REFERENCES pokedexes(id) ON DELETE CASCADE,
  "pokedexEntryId" BIGINT NOT NULL REFERENCES pokedex_entries(id) ON DELETE CASCADE,
  UNIQUE("pokedexId", "pokedexEntryId")
);

-- Create indexes for performance
CREATE INDEX idx_pokedex_entries_mapping_pokedex_id ON pokedex_entries_mapping("pokedexId");
CREATE INDEX idx_pokedex_entries_mapping_entry_id ON pokedex_entries_mapping("pokedexEntryId");

-- Enable RLS
ALTER TABLE pokedex_entries_mapping ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public read access (mapping is reference data)
CREATE POLICY "Anyone can view pokedex entries mapping"
  ON pokedex_entries_mapping
  FOR SELECT USING (true);

-- Users can only insert mappings for their own pokedexes
CREATE POLICY "Users can insert own pokedex mappings"
  ON pokedex_entries_mapping
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pokedexes
      WHERE pokedexes.id = pokedex_entries_mapping."pokedexId"
      AND pokedexes."userId" = auth.uid()
    )
  );

-- Users can only delete mappings for their own pokedexes
CREATE POLICY "Users can delete own pokedex mappings"
  ON pokedex_entries_mapping
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM pokedexes
      WHERE pokedexes.id = pokedex_entries_mapping."pokedexId"
      AND pokedexes."userId" = auth.uid()
    )
  );
