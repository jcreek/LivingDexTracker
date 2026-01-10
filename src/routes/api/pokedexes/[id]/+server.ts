import { json } from '@sveltejs/kit';
import type { Pokedex } from '$lib/models/Pokedex';
import PokedexRepository from '$lib/repositories/PokedexRepository';
import { requireAuth } from '$lib/utils/auth';
import type { RequestEvent } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Calculate expected pokedex entries based on pokedex configuration
 * Applies the same filtering logic as CombinedDataRepository
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
			.single();

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
		return [];
	}

	return data?.map((entry) => entry.id) || [];
}

/**
 * Populate pokedex_entries_mapping table for a pokedex
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

	const { error } = await supabase.from('pokedex_entries_mapping').insert(mappings);

	if (error) {
		console.error('Error populating pokedex mappings:', error);
		throw new Error(`Failed to populate pokedex mappings: ${error.message}`);
	}
}

/**
 * Recalculate pokedex_entries_mapping table for a pokedex (used on update)
 */
async function recalculatePokedexMappings(
	supabase: SupabaseClient,
	pokedexId: string,
	pokedex: Pokedex
): Promise<void> {
	// Delete old mappings
	const { error: deleteError } = await supabase
		.from('pokedex_entries_mapping')
		.delete()
		.eq('pokedexId', pokedexId);

	if (deleteError) {
		console.error('Error deleting old pokedex mappings:', deleteError);
		throw new Error(`Failed to delete old pokedex mappings: ${deleteError.message}`);
	}

	// Populate new mappings
	await populatePokedexMappings(supabase, pokedexId, pokedex);
}

// GET: Get single pokedex by ID
export const GET = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);
		const { id } = event.params;

		if (!id) {
			return json({ error: 'Pokedex ID is required' }, { status: 400 });
		}

		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		const repo = new PokedexRepository(event.locals.supabase, userId);
		const pokedex = await repo.findById(id);

		if (!pokedex) {
			// RLS ensures user can only access own pokédexes
			// Return 404 whether it doesn't exist or user doesn't own it (don't leak info)
			return json({ error: 'Pokedex not found' }, { status: 404 });
		}

		return json(pokedex);
	} catch (err) {
		console.error(err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};

// PUT: Update pokedex
export const PUT = async (event: RequestEvent) => {
	let requestedName: string | undefined;
	try {
		const userId = await requireAuth(event);
		const { id } = event.params;
		const data: Partial<Pokedex> = await event.request.json();
		requestedName = typeof data.name === 'string' ? data.name : undefined;

		if (!id) {
			return json({ error: 'Pokedex ID is required' }, { status: 400 });
		}

		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		const repo = new PokedexRepository(event.locals.supabase, userId);
		const pokedex = await repo.update(id, data);

		if (!pokedex) {
			return json({ error: 'Pokedex not found' }, { status: 404 });
		}

		// Recalculate pokedex_entries_mapping if configuration changed
		// Only recalculate if type flags or gameScope changed
		const configChanged =
			data.isFormDex !== undefined ||
			data.gameScope !== undefined ||
			(data.isLivingDex !== undefined && pokedex.isLivingDex !== data.isLivingDex) ||
			(data.isShinyDex !== undefined && pokedex.isShinyDex !== data.isShinyDex) ||
			(data.isOriginDex !== undefined && pokedex.isOriginDex !== data.isOriginDex);

		if (configChanged) {
			await recalculatePokedexMappings(event.locals.supabase, id, { ...pokedex, ...data });
		}

		return json(pokedex);
	} catch (err) {
		console.error(err);

		// Unique constraint violation (duplicate pokédex name for this user)
		if (
			err &&
			typeof err === 'object' &&
			'code' in err &&
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

// DELETE: Delete pokedex
export const DELETE = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);
		const { id } = event.params;

		if (!id) {
			return json({ error: 'Pokedex ID is required' }, { status: 400 });
		}

		const { session } = await event.locals.safeGetSession();
		if (session) {
			await event.locals.supabase.auth.setSession(session);
		}

		const repo = new PokedexRepository(event.locals.supabase, userId);

		// Verify pokedex exists and user owns it
		const pokedex = await repo.findById(id);
		if (!pokedex) {
			return json({ error: 'Pokedex not found' }, { status: 404 });
		}

		await repo.delete(id);

		return json({ success: true });
	} catch (err) {
		console.error(err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
