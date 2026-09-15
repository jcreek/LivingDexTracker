import { packGrid } from '$lib/models/PokedexGridRow';
import { error, redirect } from '@sveltejs/kit';
import PokedexRepository from '$lib/repositories/PokedexRepository';
import { loadPokedexGrid } from '$lib/services/PokedexGridService';
import { PokedexPerformance } from '$lib/server/pokedexPerformance';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, setHeaders, cookies }) => {
	const timings = new PokedexPerformance();
	const { session, user } = await timings.measure('auth', () => locals.safeGetSession());
	if (!session || !user) throw redirect(303, '/signin');
	const pokedex = await timings.measure('ownership', () =>
		new PokedexRepository(locals.supabase, user.id).findById(params.id)
	);
	if (!pokedex) throw error(404, 'Pokédex not found');
	let grid = null;
	try {
		grid = await loadPokedexGrid(locals.supabase, user.id, pokedex, timings);
	} catch {
		console.error('Unable to load Pokédex grid');
	}
	const packed = timings.prepare(() => (grid ? packGrid(grid) : null));
	timings.recordAuth(locals.pokedexAuthMs);
	const timing = timings.finish();
	setHeaders({
		'cache-control': 'private, no-store',
		...(timing ? { 'server-timing': timing } : {})
	});
	const layout = cookies.get('boxViewLayout');
	const boxViewLayout: 'comfortable' | 'compact' | 'ultra' =
		layout === 'compact' || layout === 'ultra' ? layout : 'comfortable';
	return { pokedex, grid: packed, boxViewLayout };
};
