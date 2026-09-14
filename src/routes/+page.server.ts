import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export type PublicStats = {
	pokemonCaught: number;
	users: number;
	livingDexesCompleted: number;
};

/**
 * Server-side load function for the homepage
 *
 * Signed-in users go straight to their Pokédexes. For everyone else the page renders at once and
 * the public statistics stream in afterwards, so a slow stats query never delays the first paint.
 */
export const load: PageServerLoad = async ({ fetch, locals }) => {
	const { user } = await locals.safeGetSession();
	if (user) {
		throw redirect(303, '/my-pokedexes');
	}

	const stats: Promise<PublicStats | null> = fetch('/api/stats')
		.then((response) => response.json())
		.then((statsData) => (statsData.error ? null : statsData))
		.catch(() => null);

	return { stats };
};
