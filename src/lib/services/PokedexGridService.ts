import type { SupabaseClient } from '@supabase/supabase-js';
import type { Pokedex } from '$lib/models/Pokedex';
import CombinedDataRepository from '$lib/repositories/CombinedDataRepository';
import { resolveDexScopes } from './PokedexDexScopeService';
import type { PokedexPerformance } from '$lib/server/pokedexPerformance';

export async function loadPokedexGrid(
	supabase: SupabaseClient,
	userId: string,
	pokedex: Pokedex,
	timings?: PokedexPerformance
) {
	const measure = <T>(stage: 'scopes' | 'entries' | 'catches', run: () => Promise<T>) =>
		timings ? timings.measure(stage, run) : run();
	const scopes = await measure('scopes', () => resolveDexScopes(supabase, pokedex));
	const repo = new CombinedDataRepository(supabase, userId, pokedex._id, true);
	const entries = await measure('entries', () =>
		repo.findGridEntries(pokedex.isFormDex, pokedex.gameScope || '', scopes)
	);
	return measure('catches', () => repo.joinGridCatches(entries));
}

export async function loadPokedexEntryDetail(
	supabase: SupabaseClient,
	userId: string,
	pokedex: Pokedex,
	entryId: number
) {
	const scopes = await resolveDexScopes(supabase, pokedex);
	const membership = new CombinedDataRepository(supabase, userId, pokedex._id, true);
	const entries = await membership.findGridEntries(
		pokedex.isFormDex,
		pokedex.gameScope || '',
		scopes
	);
	if (!entries.some((entry) => entry.id === entryId)) return null;
	return new CombinedDataRepository(supabase, userId, pokedex._id).findEntryDetail(entryId);
}
