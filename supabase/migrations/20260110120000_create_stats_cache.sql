-- Create stats_cache table to store cached statistics
-- This table will be updated once per day to improve performance

CREATE TABLE stats_cache (
  id BIGSERIAL PRIMARY KEY,
  pokemon_caught BIGINT NOT NULL DEFAULT 0,
  total_users BIGINT NOT NULL DEFAULT 0,
  completed_pokedexes BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_stats_cache_updated_at ON stats_cache(updated_at DESC);

-- Enable RLS
ALTER TABLE stats_cache ENABLE ROW LEVEL SECURITY;

-- RLS policies: Only allow reads (stats are public)
CREATE POLICY "Anyone can view stats cache" ON stats_cache
  FOR SELECT USING (true);

-- No insert/update/delete policies - only database functions can modify this table
