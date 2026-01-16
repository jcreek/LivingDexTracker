import type { Pokedex } from '$lib/models/Pokedex';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Calculate expected pokedex entries based on pokedex configuration
 * Applies the same filtering logic as CombinedDataRepository
 * @throws Error if the Supabase query fails
 */
export async function calculateExpectedEntries(
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
		// Determine region from gameScope using games table.
		// We keep games.region as a denormalized convenience column.
		const { data: regionData, error: regionError } = await supabase
			.from('games')
			.select('region')
			.eq('displayName', pokedex.gameScope)
			.maybeSingle();

		if (regionError) {
			console.error('Error looking up region for gameScope:', pokedex.gameScope, regionError);
			throw new Error(
				`Failed to lookup region for gameScope "${pokedex.gameScope}": ${regionError.message}`
			);
		}

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
export async function populatePokedexMappings(
	supabase: SupabaseClient,
	pokedexId: string,
	pokedex: Pokedex
): Promise<void> {
	const expectedEntryIds = await calculateExpectedEntries(supabase, pokedex);

	if (expectedEntryIds.length === 0) {
		console.warn(`No expected entries calculated for pokedex ${pokedexId}`);
		return;
	}

	// New schema writes to pokedex_pokemon_mapping; column is pokemonId
	const mappings = expectedEntryIds.map((pokemonId) => ({
		pokedexId,
		pokemonId
	}));

	// Process in chunks to avoid request size limits
	const CHUNK_SIZE = 500;
	for (let i = 0; i < mappings.length; i += CHUNK_SIZE) {
		const chunk = mappings.slice(i, i + CHUNK_SIZE);
		const { error } = await supabase.from('pokedex_pokemon_mapping').upsert(chunk, {
			onConflict: 'pokedexId,pokemonId',
			ignoreDuplicates: true
		});

		if (error) {
			console.error('Error populating pokedex mappings:', error);
			throw new Error(`Failed to populate pokedex mappings: ${error.message}`);
		}
	}
}

/**
 * Recalculate pokedex_entries_mapping table for a pokedex (used on update)
 * Uses a single atomic RPC call to prevent orphaned pokedexes
 * @throws Error if the Supabase RPC call fails
 */
export async function recalculatePokedexMappings(
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
