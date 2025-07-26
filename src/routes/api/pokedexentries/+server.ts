import { json } from '@sveltejs/kit';
import PokedexEntryRepository from '$lib/repositories/PokedexEntryRepository';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	try {
		const repo = new PokedexEntryRepository(event.locals.supabase);
		const pokemonData = await repo.findAll();
		return json(pokemonData);
	} catch (error) {
		console.error('Error fetching pokedex entries:', error);
		return json({ error: 'Failed to fetch pokedex entries' }, { status: 500 });
	}
};
