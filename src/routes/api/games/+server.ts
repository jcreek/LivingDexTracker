import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * GET /api/games
 * Returns all games from the games table, sorted by release year descending (newest first)
 */
export const GET: RequestHandler = async ({ locals }) => {
	const { supabase } = locals;

	try {
		// Query games table for all games, sorted by release year descending
		const { data, error } = await supabase
			.from('games')
			.select('displayName, releaseYear')
			.order('releaseYear', { ascending: false })
			.order('displayName', { ascending: true }); // Secondary sort by name for same year

		if (error) {
			console.error('Error fetching games:', error);
			return json({ error: 'Failed to fetch games' }, { status: 500 });
		}

		// Extract just the display names
		const gameNames = data.map((row) => row.displayName);

		return json({ games: gameNames });
	} catch (err) {
		console.error('Unexpected error fetching games:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
