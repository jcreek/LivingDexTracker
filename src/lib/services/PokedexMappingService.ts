import type { Pokedex } from '$lib/models/Pokedex';
import type { SupabaseClient } from '@supabase/supabase-js';
import { resolveDexScopes } from '$lib/services/PokedexDexScopeService';

// PostgREST caps every response at `max_rows` (1000, see supabase/config.toml) and truncates
// SILENTLY rather than erroring, so any query here that can return more must page. All three
// can: game_pokedex_entries holds 11k+ rows, the base-form set is 1025 and a form dex 1390.
const MAX_ROWS_PER_REQUEST = 1000;
// Keeps `.in()` lists well clear of URL length limits.
const ID_CHUNK_SIZE = 500;

type PageResult = { data: unknown[] | null; error: { message: string } | null };

/** Repeatedly fetch `fetchPage` ranges until a short page signals the end. */
async function fetchAllRows<T>(
	fetchPage: (from: number, to: number) => PromiseLike<PageResult>,
	context: string
): Promise<T[]> {
	const rows: T[] = [];

	for (let from = 0; ; from += MAX_ROWS_PER_REQUEST) {
		const { data, error } = await fetchPage(from, from + MAX_ROWS_PER_REQUEST - 1);

		if (error) {
			console.error(`Error ${context}:`, error);
			throw new Error(`Failed to ${context}: ${error.message}`);
		}

		if (!data?.length) break;
		rows.push(...(data as T[]));
		if (data.length < MAX_ROWS_PER_REQUEST) break;
	}

	return rows;
}

function chunk<T>(values: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < values.length; i += size) chunks.push(values.slice(i, i + size));
	return chunks;
}

/**
 * Calculate expected pokedex entries based on pokedex configuration
 * Applies the same filtering logic as CombinedDataRepository
 * @throws Error if the Supabase query fails
 */
export async function calculateExpectedEntries(
	supabase: SupabaseClient,
	pokedex: Pokedex
): Promise<number[]> {
	const dexScopes = await resolveDexScopes(supabase, pokedex);

	if (dexScopes.length > 0) {
		const dexEntries = await fetchAllRows<{ pokemonId: number }>(
			(from, to) =>
				supabase
					.from('game_pokedex_entries')
					.select('pokemonId')
					.in('dexId', dexScopes)
					// (dexId, pokemonId) is the primary key, so this orders pages deterministically.
					.order('dexId', { ascending: true })
					.order('pokemonId', { ascending: true })
					.range(from, to),
			'calculate dex-scoped entries'
		);

		const uniqueIds = Array.from(new Set(dexEntries.map((row) => row.pokemonId)));
		if (uniqueIds.length === 0) return [];

		if (!pokedex.isFormDex) {
			const entries: { id: number; isDefaultForm: boolean }[] = [];

			for (const ids of chunk(uniqueIds, ID_CHUNK_SIZE)) {
				const { data, error } = await supabase
					.from('pokedex_entries')
					.select('id, isDefaultForm')
					.in('id', ids)
					.returns<{ id: number; isDefaultForm: boolean }[]>();

				if (error) {
					console.error('Error filtering base forms for dex scopes:', error);
					throw new Error(`Failed to filter base forms: ${error.message}`);
				}

				if (data) entries.push(...data);
			}

			// Gendered species (form='male') and Unown ('A') are also flagged isDefaultForm
			// in the pokemon table, so this single check covers them.
			return entries.filter((entry) => entry.isDefaultForm).map((entry) => entry.id);
		}

		return uniqueIds;
	}

	// Resolve the region up front so each page can be built from scratch below. A PostgREST
	// builder is single-use, so it must be rebuilt per page rather than reused.
	let region: string | null = null;
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

		region = regionData?.region ?? null;
	}

	const buildQuery = () => {
		let query = supabase.from('pokedex_entries').select('id');

		// Apply form filter: if isFormDex is false, only include base forms. Gendered species
		// (form='male') and Unown ('A') are also flagged isDefaultForm, so this covers them too.
		if (!pokedex.isFormDex) {
			query = query.eq('isDefaultForm', true);
		}

		// Apply region filter: if gameScope is specified, filter by region
		if (region) {
			query = query.eq('regionToCatchIn', region);
		}

		// Apply game filter: if gameScope is specified, filter by gamesToCatchIn array
		if (pokedex.gameScope) {
			query = query.contains('gamesToCatchIn', [pokedex.gameScope]);
		}

		return query;
	};

	const entries = await fetchAllRows<{ id: number }>(
		(from, to) => buildQuery().order('id', { ascending: true }).range(from, to),
		'calculate expected entries'
	);

	return entries.map((entry) => entry.id);
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
