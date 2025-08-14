import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { UserPokedexRepository } from '$lib/repositories';
import { checkAuthentication, unauthorizedResponse } from '$lib/auth-utils';

export const GET: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	const auth = await checkAuthentication(safeGetSession);

	if (!auth.isAuthenticated) {
		console.log('GET /api/pokedexes auth failed:', auth.error);
		return json(unauthorizedResponse(auth.error), { status: 401 });
	}
	
	const { user } = auth;

	try {
		const repo = new UserPokedexRepository(supabase);
		const pokedexes = await repo.getByUserId(user.id);

		return json({ pokedexes });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
	const auth = await checkAuthentication(safeGetSession);

	if (!auth.isAuthenticated) {
		console.log('POST /api/pokedexes auth failed:', auth.error);
		return json(unauthorizedResponse(auth.error), { status: 401 });
	}
	
	const { user } = auth;

	try {
		const data = await request.json();
		const repo = new UserPokedexRepository(supabase);

		const pokedex = await repo.create({
			userId: user.id,
			name: data.name,
			gameScope: data.gameScope || 'all_games',
			regionalPokedexName: data.regionalPokedexName || 'national',
			isShiny: data.isShiny || false,
			requireOrigin: data.requireOrigin || false,
			includeForms: data.includeForms || false,
			generation: data.generation || null
		});

		return json({ pokedex }, { status: 201 });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};
