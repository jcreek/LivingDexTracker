import type { SupabaseClient } from '@supabase/supabase-js';
import CombinedDataRepository from '$lib/repositories/CombinedDataRepository';
import { resolveDexScopes } from '$lib/services/PokedexDexScopeService';
import type { Pokedex } from '$lib/models/Pokedex';

export type CombinedDataQuery = {
	page: number;
	limit: number;
	enableForms: boolean;
	region?: string;
	game?: string;
};

/**
 * Loads one page of a Pokédex's entries joined with the owner's catch records. Shared by the
 * combined-data API and the Pokédex page's server load so both return exactly the same data.
 * The caller must already have checked that `userId` owns `pokedex`.
 */
export async function loadCombinedDataPage(
	supabase: SupabaseClient,
	userId: string,
	pokedex: Pokedex,
	{ page, limit, enableForms, region = '', game = '' }: CombinedDataQuery
) {
	// Use the pokédex's gameScope as the default filter if no manual game filter is set.
	const effectiveGame = game || pokedex.gameScope || '';
	const dexScopes = await resolveDexScopes(supabase, pokedex);
	const repo = new CombinedDataRepository(supabase, userId, pokedex._id);

	// The rows and the count are independent queries, so run them together.
	const [combinedData, totalCount] = await Promise.all([
		repo.findCombinedData(userId, page, limit, enableForms, region, effectiveGame, dexScopes),
		repo.countCombinedData(enableForms, region, effectiveGame, dexScopes)
	]);

	return {
		combinedData,
		totalPages: Math.ceil(totalCount / limit),
		currentPage: page,
		totalCount
	};
}
