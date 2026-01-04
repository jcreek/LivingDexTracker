-- Truncate existing catch records (no real users, as confirmed)
TRUNCATE TABLE catch_records;

-- Add pokedexId column
ALTER TABLE catch_records
  ADD COLUMN "pokedexId" UUID REFERENCES pokedexes(id) ON DELETE CASCADE;

-- Make pokedexId NOT NULL
ALTER TABLE catch_records
  ALTER COLUMN "pokedexId" SET NOT NULL;

-- Drop old unique constraint (userId, pokedexEntryId)
ALTER TABLE catch_records
  DROP CONSTRAINT IF EXISTS catch_records_userId_pokedexEntryId_key;

-- Add new unique constraint (userId, pokedexEntryId, pokedexId)
ALTER TABLE catch_records
  ADD CONSTRAINT catch_records_user_pokemon_pokedex_unique
  UNIQUE("userId", "pokedexEntryId", "pokedexId");

-- Add index for performance
CREATE INDEX idx_catch_records_pokedex_id ON catch_records("pokedexId");

-- RLS POLICIES - CRITICAL: Users can ONLY access catch records for their own pokédexes

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Users can view own catch records" ON catch_records;
DROP POLICY IF EXISTS "Users can insert own catch records" ON catch_records;
DROP POLICY IF EXISTS "Users can update own catch records" ON catch_records;
DROP POLICY IF EXISTS "Users can delete own catch records" ON catch_records;

-- Users can ONLY view catch records for their own pokédexes
CREATE POLICY "Users can view own catch records" ON catch_records
  FOR SELECT USING (
    auth.uid() = "userId" AND
    EXISTS (
      SELECT 1 FROM pokedexes
      WHERE pokedexes.id = catch_records."pokedexId"
      AND pokedexes."userId" = auth.uid()
    )
  );

-- Users can ONLY insert catch records for their own pokédexes
CREATE POLICY "Users can insert own catch records" ON catch_records
  FOR INSERT WITH CHECK (
    auth.uid() = "userId" AND
    EXISTS (
      SELECT 1 FROM pokedexes
      WHERE pokedexes.id = catch_records."pokedexId"
      AND pokedexes."userId" = auth.uid()
    )
  );

-- Users can ONLY update catch records for their own pokédexes
CREATE POLICY "Users can update own catch records" ON catch_records
  FOR UPDATE USING (
    auth.uid() = "userId" AND
    EXISTS (
      SELECT 1 FROM pokedexes
      WHERE pokedexes.id = catch_records."pokedexId"
      AND pokedexes."userId" = auth.uid()
    )
  );

-- Users can ONLY delete catch records for their own pokédexes
CREATE POLICY "Users can delete own catch records" ON catch_records
  FOR DELETE USING (
    auth.uid() = "userId" AND
    EXISTS (
      SELECT 1 FROM pokedexes
      WHERE pokedexes.id = catch_records."pokedexId"
      AND pokedexes."userId" = auth.uid()
    )
  );
