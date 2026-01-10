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
	let requestedName: string | undefined;
	try {
		const userId = await requireAuth(event);
		const data: Partial<Pokedex> = await event.request.json();
		requestedName = typeof data.name === 'string' ? data.name : undefined;
		data.userId = userId;

		const repo = new PokedexRepository(event.locals.supabase, userId);
		const pokedex = await repo.create(data);
		return json(pokedex);
	} catch (err) {
		console.error('Error in POST /api/pokedexes:', err);

		// Unique constraint violation (duplicate pokédex name for this user)
		if (
			err &&
			typeof err === 'object' &&
			'code' in err &&
			// Postgres unique_violation
			(err as { code?: unknown }).code === '23505'
		) {
			return json(
				{
					error: requestedName
						? `You already have a Pokédex named "${requestedName}". Please choose a different name.`
						: 'You already have a Pokédex with that name. Please choose a different name.'
				},
				{ status: 409 }
			);
		}

		if (err && typeof err === 'object' && 'status' in err) throw err;
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
