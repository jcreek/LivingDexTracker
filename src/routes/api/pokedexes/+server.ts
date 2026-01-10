import { json } from '@sveltejs/kit';
import type { Pokedex } from '$lib/models/Pokedex';
import PokedexRepository from '$lib/repositories/PokedexRepository';
import { requireAuth } from '$lib/utils/auth';
import type { RequestEvent } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Calculate expected pokedex entries based on pokedex configuration
 * Applies the same filtering logic as CombinedDataRepository
 * @throws Error if the Supabase query fails
 */
async function calculateExpectedEntries(
	supabase: SupabaseClient,
	pokedex: Pokedex
): Promise<number[]> {
	let query = supabase.from('pokedex_entries').select('id');

	// Apply form filter: if isFormDex is false, only include base forms
	// Base forms have form IS NULL, except Unown which has no base form (use 'A')
	if (!pokedex.isFormDex) {
		query = query.or('form.is.null,and(pokemon.eq.Unown,form.eq.A)');
	}

	// Apply region filter: if gameScope is specified, filter by region
	if (pokedex.gameScope) {
		// Determine region from gameScope using region_game_mappings
		const { data: regionData } = await supabase
			.from('region_game_mappings')
			.select('region')
			.eq('game', pokedex.gameScope)
			.maybeSingle();

		if (regionData?.region) {
			query = query.eq('regionToCatchIn', regionData.region);
		}
	}

	// Apply game filter: if gameScope is specified, filter by gamesToCatchIn array
	if (pokedex.gameScope) {
		query = query.contains('gamesToCatchIn', [pokedex.gameScope]);
	}

	const { data, error } = await query;

	if (error) {
		console.error('Error calculating expected entries:', error);
		throw new Error(`Failed to calculate expected entries: ${error.message}`);
	}

	return data?.map((entry) => entry.id) || [];
}

/**
 * Populate pokedex_entries_mapping table for a pokedex
 * Uses chunked upsert to avoid UNIQUE constraint violations and request size limits
 * @throws Error if the Supabase upsert fails
 */
async function populatePokedexMappings(
	supabase: SupabaseClient,
	pokedexId: string,
	pokedex: Pokedex
): Promise<void> {
	const expectedEntryIds = await calculateExpectedEntries(supabase, pokedex);

	if (expectedEntryIds.length === 0) {
		console.warn(`No expected entries calculated for pokedex ${pokedexId}`);
		return;
	}

	const mappings = expectedEntryIds.map((pokedexEntryId) => ({
		pokedexId,
		pokedexEntryId
	}));

	// Process in chunks to avoid request size limits
	const CHUNK_SIZE = 500;
	for (let i = 0; i < mappings.length; i += CHUNK_SIZE) {
		const chunk = mappings.slice(i, i + CHUNK_SIZE);
		const { error } = await supabase.from('pokedex_entries_mapping').upsert(chunk, {
			onConflict: 'pokedexId,pokedexEntryId',
			ignoreDuplicates: true
		});

		if (error) {
			console.error('Error populating pokedex mappings:', error);
			throw new Error(`Failed to populate pokedex mappings: ${error.message}`);
		}
	}
}

// GET: List all pokedexes for user
export const GET = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);
		const repo = new PokedexRepository(event.locals.supabase, userId);
		const pokedexes = await repo.findAll();
		return json(pokedexes);
	} catch (err) {
		console.error('Error in GET /api/pokedexes:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};

// POST: Create new pokedex
export const POST = async (event: RequestEvent) => {
	let requestedName: string | undefined;
	try {
		const userId = await requireAuth(event);
		const data: Partial<Pokedex> = await event.request.json();
		requestedName = typeof data.name === 'string' ? data.name : undefined;
		data.userId = userId;

		const repo = new PokedexRepository(event.locals.supabase, userId);
		const pokedex = await repo.create(data);

		// Populate pokedex_entries_mapping table with expected entries
		await populatePokedexMappings(event.locals.supabase, pokedex._id, pokedex);

		return json(pokedex);
	} catch (err) {
		console.error('Error in POST /api/pokedexes:', err);

		// Unique constraint violation (duplicate pokédex name for this user)
		if (
			err &&
			typeof err === 'object' &&
			'code' in err &&
			// Postgres unique_violation
			(err as { code?: unknown }).code === '23505'
		) {
			return json(
				{
					error: requestedName
						? `You already have a Pokédex named "${requestedName}". Please choose a different name.`
						: 'You already have a Pokédex with that name. Please choose a different name.'
				},
				{ status: 409 }
			);
		}

		if (err && typeof err === 'object' && 'status' in err) throw err;
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
