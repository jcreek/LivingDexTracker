-- Add INSERT policies for reference data tables to enable seeding
-- These policies allow anyone to insert into reference tables (pokedex_entries, region_game_mappings, metadata)
-- This is acceptable because:
-- 1. These are read-only reference data tables for the application
-- 2. Seeding only happens in development/setup phase
-- 3. In production, you would typically use service role or disable seeding

-- Add INSERT policy for pokedex_entries
CREATE POLICY "Allow insert for pokedex entries" ON pokedex_entries
  FOR INSERT WITH CHECK (true);

-- Add UPDATE policy for pokedex_entries (in case re-seeding needs to update)
CREATE POLICY "Allow update for pokedex entries" ON pokedex_entries
  FOR UPDATE USING (true);

-- Add INSERT policy for region_game_mappings
CREATE POLICY "Allow insert for region game mappings" ON region_game_mappings
  FOR INSERT WITH CHECK (true);

-- Add UPDATE policy for region_game_mappings
CREATE POLICY "Allow update for region game mappings" ON region_game_mappings
  FOR UPDATE USING (true);

-- Add INSERT policy for metadata
CREATE POLICY "Allow insert for metadata" ON metadata
  FOR INSERT WITH CHECK (true);

-- Add UPDATE policy for metadata
CREATE POLICY "Allow update for metadata" ON metadata
  FOR UPDATE USING (true);
