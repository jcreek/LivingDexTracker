import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, url, fetch }) => {
	const { session } = await parent();

	if (!session) {
		throw redirect(303, '/signin');
	}

	const pokedexId = url.searchParams.get('id');

	// If no pokédex ID is provided, try to get the user's first pokédex
	if (!pokedexId) {
		try {
			const response = await fetch('/api/pokedexes');
			const result = await response.json();

			if (response.ok && result.pokedexes.length > 0) {
				// Redirect to the first pokédex
				throw redirect(303, `/mydex?id=${result.pokedexes[0].id}`);
			} else {
				// No pokédexes found, redirect to create one
				throw redirect(303, '/pokedexes');
			}
		} catch (error) {
			// On error, redirect to pokédexes page
			throw redirect(303, '/pokedexes');
		}
	}

	return {
		session,
		pokedexId
	};
};
