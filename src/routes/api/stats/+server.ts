import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * GET /api/stats
 *
 * Returns public statistics about the application:
 * - pokemonCaught: Total count of caught Pokémon
 * - users: Total count of users
 * - livingDexesCompleted: Total count of completed pokedexes
 *
 * Stats are cached for 24 hours to improve performance.
 * The first request after 24 hours will trigger a cache refresh.
 */
export const GET = async (event: RequestEvent) => {
	try {
		// Call the database function to get stats (with caching)
		const { data, error } = await event.locals.supabase.rpc('get_public_stats');

		if (error) {
			console.error('Error fetching stats:', error);
			return json({ error: 'Failed to fetch stats' }, { status: 500 });
		}

		if (!data || data.length === 0) {
			return json({ error: 'No stats data found' }, { status: 404 });
		}

		const stats = data[0];
		return json({
			pokemonCaught: stats.pokemon_caught,
			users: stats.total_users,
			livingDexesCompleted: stats.completed_pokedexes,
			updatedAt: stats.updated_at
		});
	} catch (err) {
		console.error('Error in GET /api/stats:', err);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
