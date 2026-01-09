-- Create pokedexes table
CREATE TABLE pokedexes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,

  -- Type flags (combinable)
  "isLivingDex" BOOLEAN DEFAULT FALSE,
  "isShinyDex" BOOLEAN DEFAULT FALSE,
  "isOriginDex" BOOLEAN DEFAULT FALSE,
  "isFormDex" BOOLEAN DEFAULT FALSE,

  -- Scope (NULL = all games, or specific game)
  "gameScope" TEXT,

  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),

  -- User can't have duplicate pokédex names
  UNIQUE("userId", name)
);

-- Create index for performance
CREATE INDEX idx_pokedexes_user_id ON pokedexes("userId");

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER update_pokedexes_updated_at
    BEFORE UPDATE ON pokedexes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE pokedexes ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES - CRITICAL: Users can ONLY access their own pokédexes

-- Users can ONLY view their own pokédexes
CREATE POLICY "Users can view own pokedexes" ON pokedexes
  FOR SELECT USING (auth.uid() = "userId");

-- Users can ONLY create pokédexes for themselves
CREATE POLICY "Users can create own pokedexes" ON pokedexes
  FOR INSERT WITH CHECK (auth.uid() = "userId");

-- Users can ONLY update their own pokédexes
CREATE POLICY "Users can update own pokedexes" ON pokedexes
  FOR UPDATE USING (auth.uid() = "userId");

-- Users can ONLY delete their own pokédexes
CREATE POLICY "Users can delete own pokedexes" ON pokedexes
  FOR DELETE USING (auth.uid() = "userId");
