-- Fix catch_records uniqueness for multi-pokédex support.
--
-- Intended invariant:
--   one catch record per (userId, pokedexId, pokedexEntryId)
--
-- This migration is written to be safe to run even if parts of the schema already exist.

-- 1) Ensure pokedexId column exists
ALTER TABLE public.catch_records
	ADD COLUMN IF NOT EXISTS "pokedexId" UUID;

-- 1.5) Guards: fail early with diagnostics if the backfill would be unsafe.
--
-- Why:
--   - The backfill below only updates rows for users that have at least one pokedex.
--     If any user has catch_records but no pokedexes, those rows would remain NULL
--     and the NOT NULL enforcement would fail.
--   - The backfill assigns all NULL pokedexId rows to each user's oldest pokedex.
--     That can create duplicate (userId, pokedexId, pokedexEntryId) combinations.
--
-- If either condition is detected, this migration aborts and prints sample IDs.
DO $$
DECLARE
	orphan_user_count bigint;
	orphan_row_count bigint;
	orphan_user_samples text;

	dup_group_count bigint;
	dup_group_samples text;
BEGIN
	-- Guard A: Any catch_records with NULL pokedexId for users who have no pokedexes?
	WITH orphan_users AS (
		SELECT cr."userId" AS user_id,
			   COUNT(*)::bigint AS null_row_count
		FROM public.catch_records cr
		WHERE cr."pokedexId" IS NULL
			AND NOT EXISTS (
				SELECT 1
				FROM public.pokedexes p
				WHERE p."userId" = cr."userId"
			)
		GROUP BY cr."userId"
	)
	SELECT
		COUNT(*)::bigint,
		COALESCE(SUM(null_row_count), 0)::bigint,
		(
			SELECT string_agg(user_id::text, ', ' ORDER BY user_id::text)
			FROM (
				SELECT user_id, null_row_count
				FROM orphan_users
				ORDER BY null_row_count DESC, user_id
				LIMIT 10
			) s
		)
	INTO orphan_user_count, orphan_row_count, orphan_user_samples
	FROM orphan_users;

	IF orphan_user_count > 0 THEN
		RAISE EXCEPTION
			'USAFE MIGRATION: found % user(s) with % catch_records row(s) where "pokedexId" is NULL but the user has no pokedexes. Sample userId(s): %',
			orphan_user_count,
			orphan_row_count,
			COALESCE(orphan_user_samples, '(none)');
	END IF;

	-- Guard B: Would assigning NULL pokedexId rows to each user''s oldest pokedex create duplicates?
	WITH primary_pokedex AS (
		SELECT DISTINCT ON ("userId") id AS pokedex_id, "userId"
		FROM public.pokedexes
		ORDER BY "userId", "createdAt" ASC
	),
	projected AS (
		SELECT
			cr."userId",
			COALESCE(cr."pokedexId", pp.pokedex_id) AS projected_pokedex_id,
			cr."pokedexEntryId"
		FROM public.catch_records cr
		LEFT JOIN primary_pokedex pp
			ON pp."userId" = cr."userId"
	),
	dup_groups AS (
		SELECT
			"userId",
			projected_pokedex_id,
			"pokedexEntryId",
			COUNT(*)::bigint AS row_count
		FROM projected
		WHERE projected_pokedex_id IS NOT NULL
		GROUP BY "userId", projected_pokedex_id, "pokedexEntryId"
		HAVING COUNT(*) > 1
	)
	SELECT
		COUNT(*)::bigint,
		(
			SELECT string_agg(
				format(
					'(userId=%s, pokedexId=%s, pokedexEntryId=%s, rows=%s)',
					"userId"::text,
					projected_pokedex_id::text,
					"pokedexEntryId"::text,
					row_count::text
				),
				E'\n'
				ORDER BY row_count DESC, "userId"::text
			)
			FROM (
				SELECT * FROM dup_groups
				ORDER BY row_count DESC, "userId"::text
				LIMIT 10
			) s
		)
	INTO dup_group_count, dup_group_samples
	FROM dup_groups;

	IF dup_group_count > 0 THEN
		RAISE EXCEPTION
			'USAFE MIGRATION: backfill would create % duplicate (userId, pokedexId, pokedexEntryId) group(s) after projecting NULL "pokedexId" to each user''s oldest pokedex. Sample group(s):\n%',
			dup_group_count,
			COALESCE(dup_group_samples, '(none)');
	END IF;
END $$;

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
	)
	WITH CHECK (
		auth.uid() = new."userId" AND
		EXISTS (
			SELECT 1 FROM public.pokedexes
			WHERE public.pokedexes.id = new."pokedexId"
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
