import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, url }) => {
	const { session } = await parent();
	
	if (!session) {
		throw redirect(303, '/signin');
	}

	const pokedexId = url.searchParams.get('id');
	if (!pokedexId) {
		throw redirect(303, '/pokedexes');
	}

	return {
		session,
		pokedexId
	};
};