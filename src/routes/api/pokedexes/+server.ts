import { json } from '@sveltejs/kit';
import type { Pokedex } from '$lib/models/Pokedex';
import PokedexRepository from '$lib/repositories/PokedexRepository';
import { requireAuth } from '$lib/utils/auth';
import type { RequestEvent } from '@sveltejs/kit';

// GET: List all pokedexes for user
export const GET = async (event: RequestEvent) => {
	try {
		const userId = await requireAuth(event);
		const repo = new PokedexRepository(event.locals.supabase, userId);
		const pokedexes = await repo.findAll();
		return json(pokedexes);
	} catch (err) {
		console.error('Error in GET /api/pokedexes:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};

// POST: Create new pokedex
export const POST = async (event: RequestEvent) => {
	try {
		console.log('POST /api/pokedexes - Starting request');
		const userId = await requireAuth(event);
		console.log('POST /api/pokedexes - User authenticated:', userId);

		const data: Partial<Pokedex> = await event.request.json();
		console.log('POST /api/pokedexes - Request data:', data);

		data.userId = userId;

		const repo = new PokedexRepository(event.locals.supabase, userId);
		const pokedex = await repo.create(data);
		console.log('POST /api/pokedexes - Pokédex created:', pokedex._id);

		return json(pokedex);
	} catch (err) {
		console.error('Error in POST /api/pokedexes:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
