import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listGameDexes } from '$lib/services/PokedexDexScopeService';

/**
 * GET /api/game-dexes
 * Returns game dexes grouped by game display name.
 */
export const GET: RequestHandler = async ({ locals }) => {
	try {
		const { gameDexes, gameOrder, games } = await listGameDexes(locals.supabase);
		return json({ gameDexes, gameOrder, games });
	} catch (err) {
		console.error('Unexpected error fetching game dexes:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
