-- Fix RLS SELECT policy on pokedex_entries_mapping to restrict reads to owning user
-- This prevents exposing all user mappings and ensures consistency with INSERT/DELETE policies

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view pokedex entries mapping" ON pokedex_entries_mapping;

-- Create a new SELECT policy that restricts reads to the owning user
CREATE POLICY "Users can view own pokedex entries mapping"
  ON pokedex_entries_mapping
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pokedexes
      WHERE pokedexes.id = pokedex_entries_mapping."pokedexId"
      AND pokedexes."userId" = auth.uid()
    )
  );
