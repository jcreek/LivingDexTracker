-- Add regional dex number columns to pokedex_entries table
-- Each region gets its own integer column for better query performance

ALTER TABLE pokedex_entries
ADD COLUMN IF NOT EXISTS kanto_dex_number INT,
ADD COLUMN IF NOT EXISTS johto_dex_number INT,
ADD COLUMN IF NOT EXISTS hoenn_dex_number INT,
ADD COLUMN IF NOT EXISTS sinnoh_dex_number INT,
ADD COLUMN IF NOT EXISTS unova_bw_dex_number INT,
ADD COLUMN IF NOT EXISTS unova_b2w2_dex_number INT,
ADD COLUMN IF NOT EXISTS kalos_central_dex_number INT,
ADD COLUMN IF NOT EXISTS kalos_coastal_dex_number INT,
ADD COLUMN IF NOT EXISTS kalos_mountain_dex_number INT,
ADD COLUMN IF NOT EXISTS alola_sm_dex_number INT,
ADD COLUMN IF NOT EXISTS alola_usum_dex_number INT,
ADD COLUMN IF NOT EXISTS galar_dex_number INT,
ADD COLUMN IF NOT EXISTS galar_isle_of_armor_dex_number INT,
ADD COLUMN IF NOT EXISTS galar_crown_tundra_dex_number INT,
ADD COLUMN IF NOT EXISTS hisui_dex_number INT,
ADD COLUMN IF NOT EXISTS paldea_dex_number INT;

-- Create indexes for better query performance when filtering/ordering by regional dex
-- Only indexing Kanto and Johto for now (other regions to be added incrementally)
CREATE INDEX IF NOT EXISTS idx_pokedex_entries_kanto_dex ON pokedex_entries(kanto_dex_number) WHERE kanto_dex_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pokedex_entries_johto_dex ON pokedex_entries(johto_dex_number) WHERE johto_dex_number IS NOT NULL;
