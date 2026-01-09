-- Create regional_dex_numbers table for generic regional dex number storage
-- This table replaces region-specific columns (kanto_dex_number, johto_dex_number, etc.)
-- and allows adding new regions without schema changes

CREATE TABLE IF NOT EXISTS regional_dex_numbers (
  id SERIAL PRIMARY KEY,
  pokedex_entry_id INT NOT NULL REFERENCES pokedex_entries(id) ON DELETE CASCADE,
  region TEXT NOT NULL,
  dex_number INT NOT NULL,
  UNIQUE(pokedex_entry_id, region)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_regional_dex_numbers_region ON regional_dex_numbers(region, dex_number);
CREATE INDEX IF NOT EXISTS idx_regional_dex_numbers_entry ON regional_dex_numbers(pokedex_entry_id);

-- RLS policies (read-only reference data, same pattern as pokedex_entries)
ALTER TABLE regional_dex_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON regional_dex_numbers
  FOR SELECT USING (true);
