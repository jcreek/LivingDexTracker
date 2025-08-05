import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { UserPokedexRepository } from '$lib/repositories';

export const GET: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	const { session, user } = await safeGetSession();
	
	if (!session || !user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const repo = new UserPokedexRepository(supabase);
		const pokedexes = await repo.getByUserId(user.id);
		
		return json({ pokedexes });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
	const { session, user } = await safeGetSession();
	
	if (!session || !user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const data = await request.json();
		const repo = new UserPokedexRepository(supabase);
		
		const pokedex = await repo.create({
			userId: user.id,
			name: data.name,
			gameScope: data.gameScope || 'all_games',
			regionalPokedexId: data.regionalPokedexId || null,
			isShiny: data.isShiny || false,
			requiresOrigin: data.requiresOrigin || false,
			includeForms: data.includeForms || false,
			region: data.region || null,
			games: data.games || null,
			generation: data.generation || null
		});
		
		return json({ pokedex }, { status: 201 });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};