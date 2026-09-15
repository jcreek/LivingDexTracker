import { packGrid } from '$lib/models/PokedexGridRow';
import { error, json } from '@sveltejs/kit';
import { requireAuth } from '$lib/utils/auth';
import PokedexRepository from '$lib/repositories/PokedexRepository';
import { loadPokedexGrid } from '$lib/services/PokedexGridService';
import { PokedexPerformance } from '$lib/server/pokedexPerformance';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	const timings = new PokedexPerformance();
	const userId = await timings.measure('auth', () => requireAuth(event));
	const pokedex = await timings.measure('ownership', () =>
		new PokedexRepository(event.locals.supabase, userId).findById(event.params.id)
	);
	if (!pokedex) throw error(404, 'Pokédex not found');
	const grid = await loadPokedexGrid(event.locals.supabase, userId, pokedex, timings);
	const packed = timings.prepare(() => packGrid(grid));
	timings.recordAuth(event.locals.pokedexAuthMs);
	const timing = timings.finish();
	return json(
		{ grid: packed },
		{
			headers: {
				'cache-control': 'private, no-store',
				...(timing ? { 'server-timing': timing } : {})
			}
		}
	);
};
