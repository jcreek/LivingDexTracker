import type { SupabaseClient } from '@supabase/supabase-js';
import CombinedDataRepository from '$lib/repositories/CombinedDataRepository';
import type {
	SharedCatchStatus,
	SharedPokedexData,
	SharedPokedexRpcData
} from '$lib/models/SharedPokedex';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isShareToken(value: string): boolean {
	return UUID_PATTERN.test(value);
}

export function calculateSharedProgress(statuses: SharedCatchStatus[], total: number) {
	const caught = statuses.reduce(
		(sum, status) => sum + (status.caught || status.haveToEvolve ? 1 : 0),
		0
	);
	return {
		caught,
		completionPercentage: total === 0 ? 0 : Math.round((caught / total) * 100)
	};
}

export async function loadSharedPokedex(
	supabase: SupabaseClient,
	shareToken: string
): Promise<SharedPokedexData | null> {
	if (!isShareToken(shareToken)) return null;

	const { data, error } = await supabase.rpc('get_shared_pokedex', {
		p_share_token: shareToken
	});
	if (error || !data) return null;

	const shared = data as SharedPokedexRpcData;
	const repo = new CombinedDataRepository(supabase, null, null);
	const entries = await repo.findAllCombinedData(
		'',
		shared.isFormDex,
		'',
		shared.gameScope || '',
		shared.dexScopes
	);
	const statuses = new Map(shared.catchStatuses.map((status) => [status.pokemonId, status]));
	const combinedData = entries.map(({ pokedexEntry }) => ({
		pokedexEntry,
		catchRecord: statuses.get(pokedexEntry._id) ?? null
	}));
	const visibleStatuses = combinedData.flatMap(({ catchRecord }) =>
		catchRecord ? [catchRecord] : []
	);
	const progress = calculateSharedProgress(visibleStatuses, combinedData.length);

	return {
		name: shared.name,
		description: shared.description,
		isLivingDex: shared.isLivingDex,
		isShinyDex: shared.isShinyDex,
		isOriginDex: shared.isOriginDex,
		isFormDex: shared.isFormDex,
		gameScope: shared.gameScope,
		dexScopes: shared.dexScopes,
		combinedData,
		total: combinedData.length,
		...progress
	};
}
