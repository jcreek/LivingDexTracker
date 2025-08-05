import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { RegionalPokedexRepository } from '$lib/repositories';

export const GET: RequestHandler = async ({ locals: { supabase } }) => {
	try {
		const repo = new RegionalPokedexRepository(supabase);
		const pokedexes = await repo.getAll();
		
		return json({ pokedexes });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
};