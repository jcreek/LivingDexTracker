import { json, type RequestEvent } from '@sveltejs/kit';
import CombinedDataRepository from '$lib/repositories/CombinedDataRepository';
import PokedexRepository from '$lib/repositories/PokedexRepository';
import { resolveDexScopes } from '$lib/services/PokedexDexScopeService';
import { OFFLINE_SNAPSHOT_VERSION, type OfflineSnapshot } from '$lib/models/OfflineSnapshot';
import { requireAuth } from '$lib/utils/auth';

export const GET = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);
		const pokedexes = await new PokedexRepository(event.locals.supabase, userId).findAll();
		const snapshots = await Promise.all(
			pokedexes.map(async (pokedex) => {
				const dexScopes = await resolveDexScopes(event.locals.supabase, pokedex);
				const entries = await new CombinedDataRepository(
					event.locals.supabase,
					userId,
					pokedex._id
				).findAllCombinedData(userId, pokedex.isFormDex, '', pokedex.gameScope ?? '', dexScopes);
				return { pokedex: { ...pokedex, dexScopes }, entries };
			})
		);

		const snapshot: OfflineSnapshot = {
			version: OFFLINE_SNAPSHOT_VERSION,
			generatedAt: new Date().toISOString(),
			userId,
			pokedexes: snapshots
		};

		return json(snapshot, {
			headers: {
				'Cache-Control': 'private, no-store',
				Vary: 'Cookie'
			}
		});
	} catch (error) {
		console.error('Unable to build offline snapshot:', error);
		if (error && typeof error === 'object' && 'status' in error) throw error;
		return json({ error: 'Unable to build offline snapshot' }, { status: 500 });
	}
};
