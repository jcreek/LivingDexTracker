import { error, redirect } from '@sveltejs/kit';
import PokedexRepository from '$lib/repositories/PokedexRepository';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { safeGetSession, supabase } = locals;
	const { session, user } = await safeGetSession();

	// Require authentication
	if (!session || !user) {
		throw redirect(303, '/signin');
	}

	const { id } = params;

	// Fetch pokédex to verify ownership (RLS will also block, but we want a proper 404)
	const repo = new PokedexRepository(supabase, user.id);
	const pokedex = await repo.findById(id);

	if (!pokedex) {
		// Either doesn't exist or user doesn't own it
		throw error(404, 'Pokédex not found');
	}

	return {
		pokedex
	};
};
