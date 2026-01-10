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
 * Recalculate pokedex_entries_mapping table for a pokedex (used on update)
 * Uses a single atomic RPC call to prevent orphaned pokedexes
 */
async function recalculatePokedexMappings(
	supabase: SupabaseClient,
	pokedexId: string,
	pokedex: Pokedex
): Promise<void> {
	const expectedEntryIds = await calculateExpectedEntries(supabase, pokedex);

	if (expectedEntryIds.length === 0) {
		console.warn(`No expected entries calculated for pokedex ${pokedexId}`);
		return;
	}

	// Call the atomic RPC function to delete old mappings and insert new ones
	const { error } = await supabase.rpc('recalculate_pokedex_mappings', {
		p_pokedex_id: pokedexId,
		p_entry_ids: expectedEntryIds
	});

	if (error) {
		console.error('Error recalculating pokedex mappings:', error);
		throw new Error(`Failed to recalculate pokedex mappings: ${error.message}`);
	}
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

		// Fetch the existing pokedex before update to compare values
		const existingPokedex = await repo.findById(id);
		if (!existingPokedex) {
			return json({ error: 'Pokedex not found' }, { status: 404 });
		}

		const pokedex = await repo.update(id, data);

		if (!pokedex) {
			return json({ error: 'Pokedex not found' }, { status: 404 });
		}

		// Recalculate pokedex_entries_mapping if configuration changed
		// Only recalculate if type flags or gameScope actually changed
		const configChanged =
			(data.isFormDex !== undefined && existingPokedex.isFormDex !== data.isFormDex) ||
			(data.gameScope !== undefined && existingPokedex.gameScope !== data.gameScope) ||
			(data.isLivingDex !== undefined && existingPokedex.isLivingDex !== data.isLivingDex) ||
			(data.isShinyDex !== undefined && existingPokedex.isShinyDex !== data.isShinyDex) ||
			(data.isOriginDex !== undefined && existingPokedex.isOriginDex !== data.isOriginDex);

		if (configChanged) {
			await recalculatePokedexMappings(event.locals.supabase, id, pokedex);
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
