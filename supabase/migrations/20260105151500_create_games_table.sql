-- Create games table to store game metadata
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  "displayName" TEXT NOT NULL,
  region TEXT NOT NULL,
  generation INTEGER NOT NULL,
  "releaseYear" INTEGER NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read games (public reference data)
CREATE POLICY "Games are publicly readable"
  ON games
  FOR SELECT
  TO public
  USING (true);

-- Insert games data from games.csv
INSERT INTO games (id, "displayName", region, generation, "releaseYear") VALUES
  ('red', 'Red', 'Kanto', 1, 1996),
  ('blue', 'Blue', 'Kanto', 1, 1996),
  ('yellow', 'Yellow', 'Kanto', 1, 1998),
  ('lg--pikachu', 'LG: Pikachu', 'Kanto', 7, 2018),
  ('lg--eevee', 'LG: Eevee', 'Kanto', 7, 2018),
  ('gold', 'Gold', 'Johto', 2, 1999),
  ('silver', 'Silver', 'Johto', 2, 1999),
  ('crystal', 'Crystal', 'Johto', 2, 2000),
  ('heartgold', 'HeartGold', 'Johto', 4, 2009),
  ('soulsilver', 'SoulSilver', 'Johto', 4, 2009),
  ('legends-arceus', 'Legends: Arceus', 'Hisui', 8, 2022)
ON CONFLICT (id) DO UPDATE SET
  "displayName" = EXCLUDED."displayName",
  region = EXCLUDED.region,
  generation = EXCLUDED.generation,
  "releaseYear" = EXCLUDED."releaseYear",
  "updatedAt" = NOW();
