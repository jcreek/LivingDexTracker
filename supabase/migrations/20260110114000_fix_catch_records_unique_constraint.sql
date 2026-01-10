-- Fix catch_records uniqueness for multi-pokédex support.
--
-- Intended invariant:
--   one catch record per (userId, pokedexId, pokedexEntryId)
--
-- This migration is written to be safe to run even if parts of the schema already exist.

-- 1) Ensure pokedexId column exists
ALTER TABLE public.catch_records
	ADD COLUMN IF NOT EXISTS "pokedexId" UUID;

-- 2) Best-effort backfill for any NULL pokedexId rows.
--    Strategy: assign to the user's oldest pokedex.
WITH primary_pokedex AS (
	SELECT DISTINCT ON ("userId") id AS pokedex_id, "userId"
	FROM public.pokedexes
	ORDER BY "userId", "createdAt" ASC
)
UPDATE public.catch_records cr
SET "pokedexId" = pp.pokedex_id
FROM primary_pokedex pp
WHERE cr."userId" = pp."userId"
	AND cr."pokedexId" IS NULL;

-- 3) Enforce NOT NULL + FK
ALTER TABLE public.catch_records
	ALTER COLUMN "pokedexId" SET NOT NULL;

-- Drop/recreate FK to avoid "already exists" name collisions.
ALTER TABLE public.catch_records
	DROP CONSTRAINT IF EXISTS "catch_records_pokedexId_fkey";

ALTER TABLE public.catch_records
	ADD CONSTRAINT "catch_records_pokedexId_fkey"
	FOREIGN KEY ("pokedexId") REFERENCES public.pokedexes(id) ON DELETE CASCADE;

-- 4) Replace uniqueness constraint
ALTER TABLE public.catch_records
	DROP CONSTRAINT IF EXISTS "catch_records_userId_pokedexEntryId_key";

ALTER TABLE public.catch_records
	DROP CONSTRAINT IF EXISTS "catch_records_user_pokemon_pokedex_unique";

ALTER TABLE public.catch_records
	ADD CONSTRAINT "catch_records_user_pokemon_pokedex_unique"
	UNIQUE ("userId", "pokedexId", "pokedexEntryId");

-- 5) Helpful index
CREATE INDEX IF NOT EXISTS idx_catch_records_pokedex_id ON public.catch_records("pokedexId");

-- 6) RLS policies (recreate safely)
ALTER TABLE public.catch_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own catch records" ON public.catch_records;
DROP POLICY IF EXISTS "Users can insert own catch records" ON public.catch_records;
DROP POLICY IF EXISTS "Users can update own catch records" ON public.catch_records;
DROP POLICY IF EXISTS "Users can delete own catch records" ON public.catch_records;

CREATE POLICY "Users can view own catch records" ON public.catch_records
	FOR SELECT USING (
		auth.uid() = "userId" AND
		EXISTS (
			SELECT 1 FROM public.pokedexes
			WHERE public.pokedexes.id = public.catch_records."pokedexId"
				AND public.pokedexes."userId" = auth.uid()
		)
	);

CREATE POLICY "Users can insert own catch records" ON public.catch_records
	FOR INSERT WITH CHECK (
		auth.uid() = "userId" AND
		EXISTS (
			SELECT 1 FROM public.pokedexes
			WHERE public.pokedexes.id = public.catch_records."pokedexId"
				AND public.pokedexes."userId" = auth.uid()
		)
	);

CREATE POLICY "Users can update own catch records" ON public.catch_records
	FOR UPDATE USING (
		auth.uid() = "userId" AND
		EXISTS (
			SELECT 1 FROM public.pokedexes
			WHERE public.pokedexes.id = public.catch_records."pokedexId"
				AND public.pokedexes."userId" = auth.uid()
		)
	);

CREATE POLICY "Users can delete own catch records" ON public.catch_records
	FOR DELETE USING (
		auth.uid() = "userId" AND
		EXISTS (
			SELECT 1 FROM public.pokedexes
			WHERE public.pokedexes.id = public.catch_records."pokedexId"
				AND public.pokedexes."userId" = auth.uid()
		)
	);

