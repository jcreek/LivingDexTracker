import { redirect } from '@sveltejs/kit';
import PokedexRepository from '$lib/repositories/PokedexRepository';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { safeGetSession, supabase } = locals;
	const { session, user } = await safeGetSession();

	// Require authentication
	if (!session || !user) {
		throw redirect(303, '/signin');
	}

	// Fetch pokedexes for the authenticated user
	const repo = new PokedexRepository(supabase, user.id);
	const pokedexes = await repo.findAll();

	return {
		pokedexes
	};
};
